package com.skillswap.repository;

import com.skillswap.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.skills s WHERE u.id != :currentUserId AND (" +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.bio) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.skillName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<User> searchUsersExcludingSelf(@Param("currentUserId") Long currentUserId, @Param("query") String query);

    @Query("SELECT u FROM User u WHERE u.id != :currentUserId")
    List<User> findAllExcludingSelf(@Param("currentUserId") Long currentUserId);
}
