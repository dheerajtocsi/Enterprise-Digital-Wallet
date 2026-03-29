package com.enterprise.wallet.domain.repository;

import com.enterprise.wallet.domain.entity.Transaction;
import com.enterprise.wallet.domain.enums.TransactionStatus;
import com.enterprise.wallet.domain.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {

    Page<Transaction> findByWalletIdOrderByCreatedAtDesc(String walletId, Pageable pageable);

    Page<Transaction> findByWalletIdAndStatusOrderByCreatedAtDesc(
            String walletId, TransactionStatus status, Pageable pageable);

    Page<Transaction> findByWalletIdAndTypeOrderByCreatedAtDesc(
            String walletId, TransactionType type, Pageable pageable);

    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT SUM(t.amount) FROM Transaction t " +
           "WHERE t.wallet.id = :walletId " +
           "AND t.type IN ('WITHDRAWAL', 'TRANSFER_DEBIT', 'FEE') " +
           "AND t.status = 'COMPLETED' " +
           "AND t.createdAt >= :from")
    Optional<BigDecimal> sumDailyOutflow(@Param("walletId") String walletId,
                                          @Param("from") LocalDateTime from);

    @Query("SELECT t FROM Transaction t WHERE t.wallet.id = :walletId " +
           "AND t.createdAt BETWEEN :from AND :to ORDER BY t.createdAt DESC")
    Page<Transaction> findByWalletIdAndDateRange(
            @Param("walletId") String walletId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);

    boolean existsByIdempotencyKey(String idempotencyKey);
}
