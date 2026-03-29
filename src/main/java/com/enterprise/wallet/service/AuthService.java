package com.enterprise.wallet.service;

import com.enterprise.wallet.domain.entity.RefreshToken;
import com.enterprise.wallet.domain.entity.User;
import com.enterprise.wallet.domain.repository.RefreshTokenRepository;
import com.enterprise.wallet.domain.repository.UserRepository;
import com.enterprise.wallet.dto.request.LoginRequest;
import com.enterprise.wallet.dto.request.RegisterRequest;
import com.enterprise.wallet.dto.response.AuthResponse;
import com.enterprise.wallet.dto.response.UserResponse;
import com.enterprise.wallet.encryption.AesEncryptionService;
import com.enterprise.wallet.exception.BadRequestException;
import com.enterprise.wallet.exception.ResourceNotFoundException;
import com.enterprise.wallet.exception.UnauthorizedException;
import com.enterprise.wallet.security.JwtTokenProvider;
import com.enterprise.wallet.security.WalletUserDetailsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final WalletUserDetailsService userDetailsService;
    private final AuthenticationManager authenticationManager;
    private final AesEncryptionService encryptionService;

    @Value("${app.jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       WalletUserDetailsService userDetailsService,
                       AuthenticationManager authenticationManager,
                       AesEncryptionService encryptionService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
        this.authenticationManager = authenticationManager;
        this.encryptionService = encryptionService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phoneEncrypted(encryptionService.encrypt(request.getPhone()))
                .build();
        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());
        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmailOrUsername(), request.getPassword()));
        } catch (BadCredentialsException e) {
            userRepository.findByEmail(request.getEmailOrUsername())
                    .or(() -> userRepository.findByUsername(request.getEmailOrUsername()))
                    .ifPresent(user -> {
                        userRepository.incrementFailedAttempts(user.getId());
                        if (user.getFailedLoginAttempts() >= 4) {
                            userRepository.lockUser(user.getId(), LocalDateTime.now().plusMinutes(30));
                            log.warn("User account locked: {}", user.getEmail());
                        }
                    });
            throw new UnauthorizedException("Invalid credentials");
        }
        User user = userRepository.findByEmail(request.getEmailOrUsername())
                .or(() -> userRepository.findByUsername(request.getEmailOrUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.updateLastLogin(user.getId(), LocalDateTime.now());
        refreshTokenRepository.revokeAllByUserId(user.getId());
        log.info("User logged in: {}", user.getEmail());
        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        if (!refreshToken.isValid()) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }
        refreshToken.setIsRevoked(true);
        refreshTokenRepository.save(refreshToken);
        return generateAuthResponse(refreshToken.getUser());
    }

    @Transactional
    public void logout(String userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
        log.info("User logged out: {}", userId);
    }

    private AuthResponse generateAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtTokenProvider.generateAccessToken(userDetails, user.getId());
        String refreshTokenStr = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpirationMs / 1000))
                .build();
        refreshTokenRepository.save(refreshToken);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpirationMs / 1000)
                .issuedAt(LocalDateTime.now())
                .user(mapToUserResponse(user))
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
