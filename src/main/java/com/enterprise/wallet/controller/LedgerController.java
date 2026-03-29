package com.enterprise.wallet.controller;

import com.enterprise.wallet.dto.response.ApiResponse;
import com.enterprise.wallet.dto.response.LedgerEntryResponse;
import com.enterprise.wallet.security.JwtTokenProvider;
import com.enterprise.wallet.service.LedgerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ledger")
@Tag(name = "Ledger", description = "Double-entry bookkeeping ledger records")
@SecurityRequirement(name = "Bearer Authentication")
public class LedgerController {

    private final LedgerService ledgerService;
    private final JwtTokenProvider jwtTokenProvider;

    public LedgerController(LedgerService ledgerService, JwtTokenProvider jwtTokenProvider) {
        this.ledgerService = ledgerService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @GetMapping("/{walletId}")
    @Operation(summary = "Get ledger entries for a wallet (paginated)")
    public ResponseEntity<ApiResponse<Page<LedgerEntryResponse>>> getLedger(
            @PathVariable String walletId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<LedgerEntryResponse> ledger = ledgerService.getLedger(walletId, page, size);
        return ResponseEntity.ok(ApiResponse.success(ledger));
    }
}
