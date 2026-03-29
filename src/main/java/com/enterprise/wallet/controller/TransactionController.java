package com.enterprise.wallet.controller;

import com.enterprise.wallet.dto.request.DepositRequest;
import com.enterprise.wallet.dto.request.TransferRequest;
import com.enterprise.wallet.dto.request.WithdrawRequest;
import com.enterprise.wallet.dto.response.ApiResponse;
import com.enterprise.wallet.dto.response.TransactionResponse;
import com.enterprise.wallet.security.JwtTokenProvider;
import com.enterprise.wallet.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transactions", description = "Deposits, withdrawals, transfers and history")
@SecurityRequirement(name = "Bearer Authentication")
public class TransactionController {

    private final TransactionService transactionService;
    private final JwtTokenProvider jwtTokenProvider;

    public TransactionController(TransactionService transactionService,
                                  JwtTokenProvider jwtTokenProvider) {
        this.transactionService = transactionService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/deposit")
    @Operation(summary = "Deposit funds into a wallet")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(
            @Valid @RequestBody DepositRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        TransactionResponse txn = transactionService.deposit(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Deposit successful", txn));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw funds from a wallet")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(
            @Valid @RequestBody WithdrawRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        TransactionResponse txn = transactionService.withdraw(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Withdrawal successful", txn));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer funds between wallets (P2P)")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @Valid @RequestBody TransferRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        TransactionResponse txn = transactionService.transfer(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Transfer successful", txn));
    }

    @GetMapping("/history")
    @Operation(summary = "Get transaction history for a wallet (paginated)")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getHistory(
            @RequestParam String walletId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        Page<TransactionResponse> history = transactionService.getHistory(walletId, userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    private String extractUserId(String authHeader) {
        return jwtTokenProvider.extractUserId(authHeader.substring(7));
    }
}
