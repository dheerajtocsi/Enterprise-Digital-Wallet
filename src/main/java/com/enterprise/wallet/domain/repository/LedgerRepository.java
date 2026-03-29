package com.enterprise.wallet.domain.repository;

import com.enterprise.wallet.domain.entity.LedgerEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LedgerRepository extends JpaRepository<LedgerEntry, String> {

    Page<LedgerEntry> findByWalletIdOrderByCreatedAtDesc(String walletId, Pageable pageable);

    List<LedgerEntry> findByTransactionId(String transactionId);

    @Query("SELECT SUM(CASE WHEN l.entryType = 'CREDIT' THEN l.amount ELSE -l.amount END) " +
           "FROM LedgerEntry l WHERE l.walletId = :walletId AND l.createdAt BETWEEN :from AND :to")
    BigDecimal calculateNetBalance(@Param("walletId") String walletId,
                                  @Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to);
}
