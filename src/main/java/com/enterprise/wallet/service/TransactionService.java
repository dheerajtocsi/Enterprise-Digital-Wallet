package com.enterprise.wallet.service;

import com.enterprise.wallet.domain.entity.LedgerEntry;
import com.enterprise.wallet.domain.entity.Transaction;
import com.enterprise.wallet.domain.entity.Wallet;
import com.enterprise.wallet.domain.enums.LedgerEntryType;
import com.enterprise.wallet.domain.enums.TransactionStatus;
import com.enterprise.wallet.domain.enums.TransactionType;
import com.enterprise.wallet.domain.repository.LedgerRepository;
import com.enterprise.wallet.domain.repository.TransactionRepository;
import com.enterprise.wallet.dto.request.DepositRequest;
import com.enterprise.wallet.dto.request.TransferRequest;
import com.enterprise.wallet.dto.request.WithdrawRequest;
import com.enterprise.wallet.dto.response.TransactionResponse;
import com.enterprise.wallet.exception.BadRequestException;
import com.enterprise.wallet.exception.InsufficientFundsException;
import com.enterprise.wallet.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    private final TransactionRepository transactionRepository;
    private final LedgerRepository ledgerRepository;
    private final WalletService walletService;

    public TransactionService(TransactionRepository transactionRepository,
                               LedgerRepository ledgerRepository,
                               WalletService walletService) {
        this.transactionRepository = transactionRepository;
        this.ledgerRepository = ledgerRepository;
        this.walletService = walletService;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TransactionResponse deposit(String userId, DepositRequest request) {
        String idempotencyKey = resolveIdempotencyKey(request.getIdempotencyKey());
        if (transactionRepository.existsByIdempotencyKey(idempotencyKey)) {
            return transactionRepository.findByIdempotencyKey(idempotencyKey)
                    .map(this::mapToResponse).orElseThrow();
        }
        Wallet wallet = walletService.getWalletByIdLocked(request.getWalletId());
        validateWalletActive(wallet, userId);
        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal newBalance = balanceBefore.add(request.getAmount());
        wallet.setBalance(newBalance);
        Transaction txn = Transaction.builder()
                .idempotencyKey(idempotencyKey)
                .wallet(wallet)
                .type(TransactionType.DEPOSIT)
                .status(TransactionStatus.COMPLETED)
                .amount(request.getAmount())
                .currency(wallet.getCurrency())
                .balanceBefore(balanceBefore)
                .balanceAfter(newBalance)
                .description(request.getDescription())
                .referenceId(request.getReferenceId())
                .completedAt(LocalDateTime.now())
                .build();
        txn = transactionRepository.save(txn);
        writeLedgerEntry(wallet.getId(), txn.getId(), LedgerEntryType.CREDIT,
                request.getAmount(), wallet.getCurrency(), balanceBefore, newBalance,
                "Deposit: " + (request.getDescription() != null ? request.getDescription() : ""));
        walletService.evictBalanceCache(wallet.getId());
        log.info("Deposit completed: walletId={}, amount={}, txnId={}",
                wallet.getId(), request.getAmount(), txn.getId());
        return mapToResponse(txn);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TransactionResponse withdraw(String userId, WithdrawRequest request) {
        String idempotencyKey = resolveIdempotencyKey(request.getIdempotencyKey());
        if (transactionRepository.existsByIdempotencyKey(idempotencyKey)) {
            return transactionRepository.findByIdempotencyKey(idempotencyKey)
                    .map(this::mapToResponse).orElseThrow();
        }
        Wallet wallet = walletService.getWalletByIdLocked(request.getWalletId());
        validateWalletActive(wallet, userId);
        BigDecimal available = wallet.getAvailableBalance();
        if (available.compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException(
                    "Insufficient funds. Available: " + available + " " + wallet.getCurrency());
        }
        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal newBalance = balanceBefore.subtract(request.getAmount());
        wallet.setBalance(newBalance);
        Transaction txn = Transaction.builder()
                .idempotencyKey(idempotencyKey)
                .wallet(wallet)
                .type(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.COMPLETED)
                .amount(request.getAmount())
                .currency(wallet.getCurrency())
                .balanceBefore(balanceBefore)
                .balanceAfter(newBalance)
                .description(request.getDescription())
                .completedAt(LocalDateTime.now())
                .build();
        txn = transactionRepository.save(txn);
        writeLedgerEntry(wallet.getId(), txn.getId(), LedgerEntryType.DEBIT,
                request.getAmount(), wallet.getCurrency(), balanceBefore, newBalance, "Withdrawal");
        walletService.evictBalanceCache(wallet.getId());
        log.info("Withdrawal completed: walletId={}, amount={}, txnId={}",
                wallet.getId(), request.getAmount(), txn.getId());
        return mapToResponse(txn);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TransactionResponse transfer(String userId, TransferRequest request) {
        String idempotencyKey = resolveIdempotencyKey(request.getIdempotencyKey());
        if (transactionRepository.existsByIdempotencyKey(idempotencyKey)) {
            return transactionRepository.findByIdempotencyKey(idempotencyKey)
                    .map(this::mapToResponse).orElseThrow();
        }
        Wallet srcWallet = walletService.getWalletByIdLocked(request.getFromWalletId());
        validateWalletActive(srcWallet, userId);
        Wallet dstWallet = walletService.getWalletByAddress(request.getToWalletAddress());
        if (!dstWallet.isActive()) {
            throw new BadRequestException("Destination wallet is not active");
        }
        if (srcWallet.getId().equals(dstWallet.getId())) {
            throw new BadRequestException("Cannot transfer to the same wallet");
        }
        if (!srcWallet.getCurrency().equals(dstWallet.getCurrency())) {
            throw new BadRequestException("Cross-currency transfers not supported currently");
        }
        if (srcWallet.getAvailableBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException(
                    "Insufficient funds. Available: " + srcWallet.getAvailableBalance());
        }
        BigDecimal srcBefore = srcWallet.getBalance();
        BigDecimal srcAfter = srcBefore.subtract(request.getAmount());
        srcWallet.setBalance(srcAfter);
        BigDecimal dstBefore = dstWallet.getBalance();
        BigDecimal dstAfter = dstBefore.add(request.getAmount());
        dstWallet.setBalance(dstAfter);
        String sharedRef = UUID.randomUUID().toString();
        Transaction debitTxn = Transaction.builder()
                .idempotencyKey(idempotencyKey)
                .wallet(srcWallet)
                .counterpartWalletId(dstWallet.getId())
                .type(TransactionType.TRANSFER_DEBIT)
                .status(TransactionStatus.COMPLETED)
                .amount(request.getAmount())
                .currency(srcWallet.getCurrency())
                .balanceBefore(srcBefore)
                .balanceAfter(srcAfter)
                .description(request.getDescription())
                .referenceId(sharedRef)
                .completedAt(LocalDateTime.now())
                .build();
        Transaction creditTxn = Transaction.builder()
                .idempotencyKey(idempotencyKey + "-credit")
                .wallet(dstWallet)
                .counterpartWalletId(srcWallet.getId())
                .type(TransactionType.TRANSFER_CREDIT)
                .status(TransactionStatus.COMPLETED)
                .amount(request.getAmount())
                .currency(dstWallet.getCurrency())
                .balanceBefore(dstBefore)
                .balanceAfter(dstAfter)
                .description(request.getDescription())
                .referenceId(sharedRef)
                .completedAt(LocalDateTime.now())
                .build();
        debitTxn = transactionRepository.save(debitTxn);
        creditTxn = transactionRepository.save(creditTxn);
        writeLedgerEntry(srcWallet.getId(), debitTxn.getId(), LedgerEntryType.DEBIT,
                request.getAmount(), srcWallet.getCurrency(), srcBefore, srcAfter,
                "Transfer to " + dstWallet.getWalletAddress());
        writeLedgerEntry(dstWallet.getId(), creditTxn.getId(), LedgerEntryType.CREDIT,
                request.getAmount(), dstWallet.getCurrency(), dstBefore, dstAfter,
                "Transfer from " + srcWallet.getWalletAddress());
        walletService.evictBalanceCache(srcWallet.getId());
        walletService.evictBalanceCache(dstWallet.getId());
        log.info("Transfer completed: from={}, to={}, amount={}, ref={}",
                srcWallet.getWalletAddress(), dstWallet.getWalletAddress(), request.getAmount(), sharedRef);
        return mapToResponse(debitTxn);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getHistory(String walletId, String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(walletId, pageable)
                .map(this::mapToResponse);
    }

    private void writeLedgerEntry(String walletId, String txnId, LedgerEntryType type,
                                   BigDecimal amount, com.enterprise.wallet.domain.enums.Currency currency,
                                   BigDecimal before, BigDecimal after, String description) {
        LedgerEntry entry = LedgerEntry.builder()
                .walletId(walletId).transactionId(txnId).entryType(type)
                .amount(amount).currency(currency).balanceBefore(before)
                .balanceAfter(after).description(description).build();
        ledgerRepository.save(entry);
    }

    private void validateWalletActive(Wallet wallet, String userId) {
        if (!wallet.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Wallet not found");
        }
        if (!wallet.isActive()) {
            throw new BadRequestException("Wallet is not active. Status: " + wallet.getStatus());
        }
    }

    private String resolveIdempotencyKey(String provided) {
        return (provided != null && !provided.isBlank()) ? provided : UUID.randomUUID().toString();
    }

    private TransactionResponse mapToResponse(Transaction txn) {
        return TransactionResponse.builder()
                .id(txn.getId())
                .idempotencyKey(txn.getIdempotencyKey())
                .walletId(txn.getWallet().getId())
                .counterpartWalletId(txn.getCounterpartWalletId())
                .type(txn.getType())
                .status(txn.getStatus())
                .amount(txn.getAmount())
                .fee(txn.getFee())
                .currency(txn.getCurrency())
                .balanceBefore(txn.getBalanceBefore())
                .balanceAfter(txn.getBalanceAfter())
                .description(txn.getDescription())
                .referenceId(txn.getReferenceId())
                .failureReason(txn.getFailureReason())
                .createdAt(txn.getCreatedAt())
                .completedAt(txn.getCompletedAt())
                .build();
    }
}
