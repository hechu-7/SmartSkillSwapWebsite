package com.skillswap.service;

import com.skillswap.dto.SwapPointsDto;
import com.skillswap.entity.SwapPointsTransaction;
import com.skillswap.entity.User;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.SwapPointsTransactionRepository;
import com.skillswap.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SwapPointsService {

    private final UserRepository userRepository;
    private final SwapPointsTransactionRepository transactionRepository;

    public SwapPointsService(UserRepository userRepository, SwapPointsTransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public SwapPointsDto getPointsSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<SwapPointsTransaction> transactions = transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<SwapPointsDto.TransactionDto> history = transactions.stream()
                .map(t -> new SwapPointsDto.TransactionDto(
                        t.getId(),
                        t.getAmount(),
                        t.getType(),
                        t.getDescription(),
                        t.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new SwapPointsDto(user.getSwapPoints(), history);
    }

    @Transactional
    public SwapPointsDto claimDailyBonus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setSwapPoints(user.getSwapPoints() + 15);
        userRepository.save(user);

        SwapPointsTransaction bonus = new SwapPointsTransaction(
                user, 15, "DAILY_STREAK", "Daily attendance & learning streak bonus"
        );
        transactionRepository.save(bonus);

        return getPointsSummary(userId);
    }
}
