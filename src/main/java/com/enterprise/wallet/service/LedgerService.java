package com.enterprise.wallet.service;

import com.enterprise.wallet.domain.repository.LedgerRepository;
import com.enterprise.wallet.dto.response.LedgerEntryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LedgerService {

    private final LedgerRepository ledgerRepository;

    public LedgerService(LedgerRepository ledgerRepository) {
        this.ledgerRepository = ledgerRepository;
    }

    @Transactional(readOnly = true)
    public Page<LedgerEntryResponse> getLedger(String walletId, int page, int size) {
        return ledgerRepository
                .findByWalletIdOrderByCreatedAtDesc(
                        walletId,
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(entry -> LedgerEntryResponse.builder()
                        .id(entry.getId())
                        .walletId(entry.getWalletId())
                        .transactionId(entry.getTransactionId())
                        .entryType(entry.getEntryType())
                        .amount(entry.getAmount())
                        .currency(entry.getCurrency())
                        .balanceBefore(entry.getBalanceBefore())
                        .balanceAfter(entry.getBalanceAfter())
                        .description(entry.getDescription())
                        .createdAt(entry.getCreatedAt())
                        .build());
    }
}
