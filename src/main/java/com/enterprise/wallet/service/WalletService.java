package com.enterprise.wallet.service;

import com.enterprise.wallet.domain.entity.User;
import com.enterprise.wallet.domain.entity.Wallet;
import com.enterprise.wallet.domain.enums.Currency;
import com.enterprise.wallet.domain.enums.WalletStatus;
import com.enterprise.wallet.domain.repository.UserRepository;
import com.enterprise.wallet.domain.repository.WalletRepository;
import com.enterprise.wallet.dto.request.CreateWalletRequest;
import com.enterprise.wallet.dto.response.WalletResponse;
import com.enterprise.wallet.exception.BadRequestException;
import com.enterprise.wallet.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);

    public static final String CACHE_BALANCE = "balances";

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    private static final int MAX_WALLETS_PER_USER = 5;

    public WalletService(WalletRepository walletRepository, UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WalletResponse createWallet(String userId, CreateWalletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        long walletCount = walletRepository.countByUserId(userId);
        if (walletCount >= MAX_WALLETS_PER_USER) {
            throw new BadRequestException("Maximum wallet limit (" + MAX_WALLETS_PER_USER + ") reached");
        }
        String walletAddress = generateUniqueWalletAddress(request.getCurrency());
        Wallet wallet = Wallet.builder()
                .user(user)
                .currency(request.getCurrency())
                .walletAddress(walletAddress)
                .walletName(request.getWalletName() != null
                        ? request.getWalletName()
                        : request.getCurrency().name() + " Wallet")
                .balance(BigDecimal.ZERO)
                .status(WalletStatus.ACTIVE)
                .build();
        wallet = walletRepository.save(wallet);
        log.info("Wallet created: {} for user: {}", wallet.getWalletAddress(), userId);
        return mapToResponse(wallet);
    }

    @Transactional(readOnly = true)
    public List<WalletResponse> getUserWallets(String userId) {
        return walletRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WalletResponse getWalletById(String walletId, String userId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
        validateWalletOwnership(wallet, userId);
        return mapToResponse(wallet);
    }

    @Cacheable(value = CACHE_BALANCE, key = "#walletId")
    @Transactional(readOnly = true)
    public BigDecimal getBalance(String walletId, String userId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
        validateWalletOwnership(wallet, userId);
        log.debug("Balance fetched from DB (cache miss) for wallet: {}", walletId);
        return wallet.getBalance();
    }

    @CacheEvict(value = CACHE_BALANCE, key = "#walletId")
    public void evictBalanceCache(String walletId) {
        log.debug("Balance cache evicted for wallet: {}", walletId);
    }

    @Transactional(readOnly = true)
    public Wallet getWalletByIdLocked(String walletId) {
        return walletRepository.findByIdWithLock(walletId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found: " + walletId));
    }

    @Transactional(readOnly = true)
    public Wallet getWalletByAddress(String walletAddress) {
        return walletRepository.findByWalletAddress(walletAddress)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found: " + walletAddress));
    }

    private void validateWalletOwnership(Wallet wallet, String userId) {
        if (!wallet.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Wallet not found");
        }
    }

    private String generateUniqueWalletAddress(Currency currency) {
        String address;
        do {
            long randomNum = ThreadLocalRandom.current().nextLong(10_000_000L, 99_999_999L);
            address = "EDW-" + currency.name() + "-" + randomNum;
        } while (walletRepository.existsByWalletAddress(address));
        return address;
    }

    public WalletResponse mapToResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .walletAddress(wallet.getWalletAddress())
                .walletName(wallet.getWalletName())
                .currency(wallet.getCurrency())
                .balance(wallet.getBalance())
                .availableBalance(wallet.getAvailableBalance())
                .lockedBalance(wallet.getLockedBalance())
                .dailyLimit(wallet.getDailyLimit())
                .dailySpent(wallet.getDailySpent())
                .status(wallet.getStatus())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
