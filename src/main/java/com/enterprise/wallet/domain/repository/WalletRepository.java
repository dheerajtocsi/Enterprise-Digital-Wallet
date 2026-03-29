package com.enterprise.wallet.domain.repository;

import com.enterprise.wallet.domain.entity.Wallet;
import com.enterprise.wallet.domain.enums.WalletStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, String> {

    List<Wallet> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<Wallet> findByWalletAddress(String walletAddress);

    boolean existsByWalletAddress(String walletAddress);

    List<Wallet> findByUserIdAndStatus(String userId, WalletStatus status);

    /**
     * Pessimistic write lock — Oracle SELECT FOR UPDATE.
     * Used for debit/credit operations to prevent concurrent balance corruption.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.id = :walletId")
    Optional<Wallet> findByIdWithLock(@Param("walletId") String walletId);

    @Query("SELECT COUNT(w) FROM Wallet w WHERE w.user.id = :userId")
    long countByUserId(@Param("userId") String userId);
}
