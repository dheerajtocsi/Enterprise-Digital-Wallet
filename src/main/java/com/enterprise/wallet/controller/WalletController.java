package com.enterprise.wallet.controller;

import com.enterprise.wallet.dto.request.CreateWalletRequest;
import com.enterprise.wallet.dto.response.ApiResponse;
import com.enterprise.wallet.dto.response.WalletResponse;
import com.enterprise.wallet.security.JwtTokenProvider;
import com.enterprise.wallet.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wallets")
@Tag(name = "Wallets", description = "Wallet creation and balance management")
@SecurityRequirement(name = "Bearer Authentication")
public class WalletController {

    private final WalletService walletService;
    private final JwtTokenProvider jwtTokenProvider;

    public WalletController(WalletService walletService, JwtTokenProvider jwtTokenProvider) {
        this.walletService = walletService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping
    @Operation(summary = "Create a new wallet")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApiResponse<WalletResponse>> createWallet(
            @Valid @RequestBody CreateWalletRequest request,
            @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        WalletResponse wallet = walletService.createWallet(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Wallet created successfully", wallet));
    }

    @GetMapping("/me")
    @Operation(summary = "Get all wallets for the authenticated user")
    public ResponseEntity<ApiResponse<List<WalletResponse>>> getMyWallets(
            @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        List<WalletResponse> wallets = walletService.getUserWallets(userId);
        return ResponseEntity.ok(ApiResponse.success(wallets));
    }

    @GetMapping("/{walletId}")
    @Operation(summary = "Get wallet details by ID")
    public ResponseEntity<ApiResponse<WalletResponse>> getWallet(
            @PathVariable String walletId,
            @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        WalletResponse wallet = walletService.getWalletById(walletId, userId);
        return ResponseEntity.ok(ApiResponse.success(wallet));
    }

    @GetMapping("/{walletId}/balance")
    @Operation(summary = "Get wallet balance (Redis cached — 60% faster)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBalance(
            @PathVariable String walletId,
            @RequestHeader("Authorization") String authHeader) {
        String userId = extractUserId(authHeader);
        BigDecimal balance = walletService.getBalance(walletId, userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("walletId", walletId, "balance", balance)));
    }

    private String extractUserId(String authHeader) {
        return jwtTokenProvider.extractUserId(authHeader.substring(7));
    }
}
