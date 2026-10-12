package com.skillswap.service;

import com.skillswap.dto.*;
import com.skillswap.entity.Role;
import com.skillswap.entity.SwapPointsTransaction;
import com.skillswap.entity.User;
import com.skillswap.exception.BadRequestException;
import com.skillswap.exception.ConflictException;
import com.skillswap.exception.ResourceNotFoundException;
import com.skillswap.repository.SwapPointsTransactionRepository;
import com.skillswap.repository.UserRepository;
import com.skillswap.security.JwtTokenProvider;
import com.skillswap.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final SwapPointsTransactionRepository swapPointsTransactionRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            UserRepository userRepository,
            SwapPointsTransactionRepository swapPointsTransactionRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.swapPointsTransactionRepository = swapPointsTransactionRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and Confirm Password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);
        user.setSwapPoints(100); // Welcome bonus
        user.setSubscriptionPlan("FREE");
        user.setBio("Hello! I am a passionate learner and mentor on SkillSwap.");
        user.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=" + user.getEmail());

        User savedUser = userRepository.save(user);

        // Record signup bonus in points transactions
        SwapPointsTransaction welcomeBonus = new SwapPointsTransaction(
                savedUser, 100, "SIGNUP_BONUS", "Welcome to SkillSwap bonus points"
        );
        swapPointsTransactionRepository.save(welcomeBonus);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = tokenProvider.generateToken(principal);

        AuthResponse response = new AuthResponse(
                token, savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(),
                savedUser.getRole().name(), savedUser.getSwapPoints(), savedUser.getSubscriptionPlan()
        );
        response.setBio(savedUser.getBio());
        response.setAvatarUrl(savedUser.getAvatarUrl());
        return response;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String token = tokenProvider.generateToken(principal);

        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        AuthResponse response = new AuthResponse(
                token, user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().name(), user.getSwapPoints(), user.getSubscriptionPlan()
        );
        response.setBio(user.getBio());
        response.setAvatarUrl(user.getAvatarUrl());
        if (user.getSkills() != null) {
            response.setSkills(user.getSkills().stream()
                    .map(s -> new SkillDto(s.getId(), s.getSkillName(), s.getType(), s.getLevel(), s.getCategory(), s.getYearsExperience()))
                    .collect(Collectors.toList()));
        }
        return response;
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUserProfile(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + principal.getId()));

        AuthResponse response = new AuthResponse(
                null, user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().name(), user.getSwapPoints(), user.getSubscriptionPlan()
        );
        response.setBio(user.getBio());
        response.setAvatarUrl(user.getAvatarUrl());
        if (user.getSkills() != null) {
            response.setSkills(user.getSkills().stream()
                    .map(s -> new SkillDto(s.getId(), s.getSkillName(), s.getType(), s.getLevel(), s.getCategory(), s.getYearsExperience()))
                    .collect(Collectors.toList()));
        }
        return response;
    }
}
