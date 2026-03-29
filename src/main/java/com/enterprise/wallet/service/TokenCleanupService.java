package com.enterprise.wallet.service;

import com.enterprise.wallet.domain.repository.RefreshTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TokenCleanupService {

    private static final Logger log = LoggerFactory.getLogger(TokenCleanupService.class);

    private final RefreshTokenRepository refreshTokenRepository;

    public TokenCleanupService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void purgeExpiredTokens() {
        log.info("Purging expired and revoked refresh tokens...");
        refreshTokenRepository.deleteExpiredAndRevoked(LocalDateTime.now());
        log.info("Token cleanup complete.");
    }
}
