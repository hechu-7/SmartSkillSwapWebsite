package com.skillswap.repository;

import com.skillswap.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender.id = :userId1 AND m.recipient.id = :userId2) OR " +
           "(m.sender.id = :userId2 AND m.recipient.id = :userId1) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findConversationBetween(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient.id = :userId AND m.isRead = false")
    long countUnreadMessagesForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient.id = :recipientId AND m.sender.id = :senderId AND m.isRead = false")
    long countUnreadMessagesFromSender(@Param("recipientId") Long recipientId, @Param("senderId") Long senderId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.recipient.id = :recipientId AND m.sender.id = :senderId AND m.isRead = false")
    int markConversationAsRead(@Param("recipientId") Long recipientId, @Param("senderId") Long senderId);

    @Query("SELECT DISTINCT CASE WHEN m.sender.id = :userId THEN m.recipient.id ELSE m.sender.id END " +
           "FROM Message m WHERE m.sender.id = :userId OR m.recipient.id = :userId")
    List<Long> findDistinctConversationPartnerIds(@Param("userId") Long userId);
}
