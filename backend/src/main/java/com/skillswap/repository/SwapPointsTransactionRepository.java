package com.skillswap.repository;

import com.skillswap.entity.SwapPointsTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SwapPointsTransactionRepository extends JpaRepository<SwapPointsTransaction, Long> {

    List<SwapPointsTransaction> findByUserIdOrderByCreatedAtDesc(Long userId);
}
