package com.skillswap.repository;

import com.skillswap.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByUserIdOrderByStartTimeAsc(Long userId);

    @Query("SELECT a FROM Availability a WHERE a.isBooked = false AND a.endTime > :now AND a.user.id != :excludeUserId ORDER BY a.startTime ASC")
    List<Availability> findAvailableUpcomingExcludingUser(@Param("now") LocalDateTime now, @Param("excludeUserId") Long excludeUserId);

    @Query("SELECT a FROM Availability a WHERE a.isBooked = false AND a.endTime > :now ORDER BY a.startTime ASC")
    List<Availability> findAllAvailableUpcoming(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(a) > 0 FROM Availability a WHERE a.user.id = :userId AND " +
           "((a.startTime < :endTime AND a.endTime > :startTime))")
    boolean existsOverlappingSlot(
            @Param("userId") Long userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}
