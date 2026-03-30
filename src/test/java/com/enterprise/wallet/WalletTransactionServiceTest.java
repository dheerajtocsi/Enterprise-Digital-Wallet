package com.enterprise.wallet;

import com.enterprise.wallet.domain.entity.Wallet;
import com.enterprise.wallet.domain.entity.User;
import com.enterprise.wallet.domain.enums.Currency;
import com.enterprise.wallet.domain.enums.WalletStatus;
import com.enterprise.wallet.domain.repository.TransactionRepository;
import com.enterprise.wallet.domain.repository.LedgerRepository;
import com.enterprise.wallet.dto.request.DepositRequest;
import com.enterprise.wallet.dto.request.TransferRequest;
import com.enterprise.wallet.dto.request.WithdrawRequest;
import com.enterprise.wallet.dto.response.TransactionResponse;
import com.enterprise.wallet.exception.BadRequestException;
import com.enterprise.wallet.exception.InsufficientFundsException;
import com.enterprise.wallet.service.TransactionService;
import com.enterprise.wallet.service.WalletService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletTransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private LedgerRepository ledgerRepository;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private TransactionService transactionService;

    private Wallet buildWallet(String userId, BigDecimal balance) {
        User user = User.builder()
                .id(userId).email("test@example.com").username("testuser")
                .passwordHash("hash").build();
        return Wallet.builder()
                .id("wallet-001")
                .walletAddress("EDW-INR-12345678")
                .user(user)
                .currency(Currency.INR)
                .balance(balance)
                .lockedBalance(BigDecimal.ZERO)
                .status(WalletStatus.ACTIVE)
                .version(0L)
                .build();
    }

    @Test
    void deposit_shouldIncreaseBalance() {
        Wallet wallet = buildWallet("user-001", new BigDecimal("1000.00"));
        when(walletService.getWalletByIdLocked("wallet-001")).thenReturn(wallet);
        when(transactionRepository.existsByIdempotencyKey(anyString())).thenReturn(false);
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        DepositRequest request = new DepositRequest();
        request.setWalletId("wallet-001");
        request.setAmount(new BigDecimal("500.00"));

        TransactionResponse result = transactionService.deposit("user-001", request);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo("500.00");
        assertThat(result.getBalanceAfter()).isEqualByComparingTo("1500.00");
    }

    @Test
    void withdraw_withInsufficientBalance_shouldThrow() {
        Wallet wallet = buildWallet("user-001", new BigDecimal("100.00"));
        when(walletService.getWalletByIdLocked("wallet-001")).thenReturn(wallet);
        when(transactionRepository.existsByIdempotencyKey(anyString())).thenReturn(false);

        WithdrawRequest request = new WithdrawRequest();
        request.setWalletId("wallet-001");
        request.setAmount(new BigDecimal("500.00"));

        assertThatThrownBy(() -> transactionService.withdraw("user-001", request))
                .isInstanceOf(InsufficientFundsException.class)
                .hasMessageContaining("Insufficient funds");
    }

    @Test
    void transfer_toSameWallet_shouldThrow() {
        Wallet wallet = buildWallet("user-001", new BigDecimal("1000.00"));
        when(walletService.getWalletByIdLocked("wallet-001")).thenReturn(wallet);
        when(walletService.getWalletByAddress("EDW-INR-12345678")).thenReturn(wallet);
        when(transactionRepository.existsByIdempotencyKey(anyString())).thenReturn(false);

        TransferRequest request = new TransferRequest();
        request.setSourceWalletId("wallet-001");
        request.setTargetWalletAddress("EDW-INR-12345678");
        request.setAmount(new BigDecimal("100.00"));

        assertThatThrownBy(() -> transactionService.transfer("user-001", request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("same wallet");
    }
}
