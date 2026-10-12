package com.skillswap.repository;

import com.skillswap.entity.RequestStatus;
import com.skillswap.entity.SkillRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRequestRepository extends JpaRepository<SkillRequest, Long> {

    List<SkillRequest> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<SkillRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);

    @Query("SELECT COUNT(r) > 0 FROM SkillRequest r WHERE " +
           "r.sender.id = :senderId AND r.recipient.id = :recipientId AND " +
           "r.requestedSkill = :reqSkill AND r.offeredSkill = :offSkill AND " +
           "r.status = 'PENDING'")
    boolean existsPendingDuplicate(
            @Param("senderId") Long senderId,
            @Param("recipientId") Long recipientId,
            @Param("reqSkill") String reqSkill,
            @Param("offSkill") String offSkill
    );

    @Query("SELECT r FROM SkillRequest r WHERE (r.sender.id = :userId1 AND r.recipient.id = :userId2) " +
           "OR (r.sender.id = :userId2 AND r.recipient.id = :userId1) AND r.status = 'ACCEPTED'")
    List<SkillRequest> findAcceptedConnectionsBetween(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
