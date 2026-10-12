package com.skillswap.config;

import com.skillswap.entity.*;
import com.skillswap.repository.AvailabilityRepository;
import com.skillswap.repository.SwapPointsTransactionRepository;
import com.skillswap.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final AvailabilityRepository availabilityRepository;
    private final SwapPointsTransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            AvailabilityRepository availabilityRepository,
            SwapPointsTransactionRepository transactionRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.availabilityRepository = availabilityRepository;
        this.transactionRepository = transactionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            logger.info("Database already contains registered users. Skipping initial seed.");
            return;
        }

        logger.info("Seeding initial starter accounts into TiDB...");

        // 1. Admin account
        User admin = new User("SkillSwap Admin", "admin@skillswap.edu", passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setBio("Platform administrator overseeing student learning exchange and community standards.");
        admin.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=admin@skillswap.edu");
        admin.setSwapPoints(500);
        admin.setSubscriptionPlan("PRO");
        User savedAdmin = userRepository.save(admin);
        transactionRepository.save(new SwapPointsTransaction(savedAdmin, 500, "ADMIN_CREDIT", "Initial system credit"));

        // 2. Peer mentor Elena Rostova (AI & Python student)
        User elena = new User("Elena Rostova", "elena.ai@skillswap.edu", passwordEncoder.encode("Student@123"));
        elena.setRole(Role.ROLE_USER);
        elena.setBio("CS Sophomore specializing in Machine Learning, PyTorch, and Python. Looking to learn React & UI Design!");
        elena.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=elena");
        elena.setSwapPoints(150);
        elena.setLearningInterests("React, Modern Frontend, UI/UX");

        elena.getSkills().add(new UserSkill(elena, "Python", SkillType.TEACH, SkillLevel.EXPERT, "Programming"));
        elena.getSkills().add(new UserSkill(elena, "Machine Learning", SkillType.TEACH, SkillLevel.ADVANCED, "Data Science"));
        elena.getSkills().add(new UserSkill(elena, "React", SkillType.LEARN, SkillLevel.BEGINNER, "Frontend"));
        elena.getSkills().add(new UserSkill(elena, "Figma", SkillType.LEARN, SkillLevel.BEGINNER, "Design"));

        User savedElena = userRepository.save(elena);
        transactionRepository.save(new SwapPointsTransaction(savedElena, 150, "SIGNUP_BONUS", "Welcome bonus"));

        // Add an availability slot for Elena
        Availability elenaSlot = new Availability(
                savedElena,
                "Hands-on Python & PyTorch Q&A Session",
                LocalDateTime.now().plusDays(1).withHour(15).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(1).withHour(16).withMinute(0).withSecond(0)
        );
        availabilityRepository.save(elenaSlot);

        // 3. Peer student Marcus Vance (Frontend & Cloud student)
        User marcus = new User("Marcus Vance", "marcus.dev@skillswap.edu", passwordEncoder.encode("Student@123"));
        marcus.setRole(Role.ROLE_USER);
        marcus.setBio("Junior Web Developer passionate about React, Next.js, and TypeScript. Eager to master Spring Boot and SQL.");
        marcus.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=marcus");
        marcus.setSwapPoints(120);
        marcus.setLearningInterests("Spring Boot, TiDB, Java Backend");

        marcus.getSkills().add(new UserSkill(marcus, "React", SkillType.TEACH, SkillLevel.EXPERT, "Frontend"));
        marcus.getSkills().add(new UserSkill(marcus, "TypeScript", SkillType.TEACH, SkillLevel.ADVANCED, "Programming"));
        marcus.getSkills().add(new UserSkill(marcus, "Java", SkillType.LEARN, SkillLevel.BEGINNER, "Backend"));
        marcus.getSkills().add(new UserSkill(marcus, "Spring Boot", SkillType.LEARN, SkillLevel.BEGINNER, "Backend"));

        User savedMarcus = userRepository.save(marcus);
        transactionRepository.save(new SwapPointsTransaction(savedMarcus, 120, "SIGNUP_BONUS", "Welcome bonus"));

        Availability marcusSlot = new Availability(
                savedMarcus,
                "Modern React State & Hooks Mentoring",
                LocalDateTime.now().plusDays(2).withHour(17).withMinute(0).withSecond(0),
                LocalDateTime.now().plusDays(2).withHour(18).withMinute(0).withSecond(0)
        );
        availabilityRepository.save(marcusSlot);

        logger.info("Successfully seeded Elena Rostova and Marcus Vance into TiDB!");
    }
}
