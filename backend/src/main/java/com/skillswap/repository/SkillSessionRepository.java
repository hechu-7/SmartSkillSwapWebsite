package com.skillswap.repository;

import com.skillswap.entity.SessionStatus;
import com.skillswap.entity.SkillSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SkillSessionRepository extends JpaRepository<SkillSession, Long> {

    @Query("SELECT s FROM SkillSession s WHERE s.learner.id = :userId OR s.mentor.id = :userId ORDER BY s.startTime DESC")
    List<SkillSession> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM SkillSession s WHERE (s.learner.id = :userId OR s.mentor.id = :userId) AND s.status = :status ORDER BY s.startTime ASC")
    List<SkillSession> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") SessionStatus status);

    @Query("SELECT COUNT(s) > 0 FROM SkillSession s WHERE " +
           "(s.mentor.id = :mentorId OR s.learner.id = :mentorId OR s.mentor.id = :learnerId OR s.learner.id = :learnerId) AND " +
           "s.status IN ('REQUESTED', 'CONFIRMED') AND " +
           "((s.startTime < :endTime AND s.endTime > :startTime))")
    boolean existsOverlappingSession(
            @Param("mentorId") Long mentorId,
            @Param("learnerId") Long learnerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    long countByLearnerIdOrMentorIdAndStatus(Long learnerId, Long mentorId, SessionStatus status);
}
