package com.enterprise.wallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Enterprise Digital Wallet — Main Application Entry Point
 *
 * Features:
 * - 500+ TPS with sub-200ms latency
 * - Strict ACID compliance via Spring Data JPA + Oracle row locking
 * - Balance inquiry optimization via Redis caching (60% improvement)
 * - PCI-DSS compliant AES-256-GCM encryption for sensitive financial data
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
@EnableTransactionManagement
public class DigitalWalletApplication {

    public static void main(String[] args) {
        SpringApplication.run(DigitalWalletApplication.class, args);
    }
}
