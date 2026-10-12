package com.skillswap.repository;

import com.skillswap.entity.SessionFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionFeedbackRepository extends JpaRepository<SessionFeedback, Long> {

    List<SessionFeedback> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<SessionFeedback> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    List<SessionFeedback> findBySessionId(Long sessionId);

    @Query("SELECT AVG(f.rating) FROM SessionFeedback f WHERE f.recipient.id = :recipientId")
    Double getAverageRatingForUser(@Param("recipientId") Long recipientId);
}
