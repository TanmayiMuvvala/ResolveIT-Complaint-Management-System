package com.resolveit.controller;

import com.resolveit.dto.*;
import com.resolveit.model.PasswordResetToken;
import com.resolveit.model.Role;
import com.resolveit.model.User;
import com.resolveit.repository.PasswordResetTokenRepository;
import com.resolveit.repository.RoleRepository;
import com.resolveit.repository.UserRepository;
import com.resolveit.security.JwtService;
import com.resolveit.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest req) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (userRepository.findByEmail(req.getEmail()).isPresent()) {
                response.put("status", "error");
                response.put("message", "Email already registered");
                return response;
            }

            User user = new User();
            user.setFullName(req.getName());
            user.setUsername(req.getName().toLowerCase().replaceAll("\\s+", ""));
            user.setEmail(req.getEmail());
            user.setPassword(passwordEncoder.encode(req.getPassword()));

            // Assign default USER role
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Default role not found"));
            user.setRoles(Set.of(userRole));

            userRepository.save(user);

            // Send welcome email
            try {
                emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
            } catch (Exception e) {
                // Log the error but don't fail registration
                System.err.println("Failed to send welcome email: " + e.getMessage());
            }

            response.put("status", "success");
            response.put("message", "Registered Successfully");
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", "Registration failed: " + e.getMessage());
            return response;
        }
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req) {
        Map<String, Object> response = new HashMap<>();

        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null) {
            response.put("status", "error");
            response.put("message", "Invalid Email");
            return response;
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            response.put("status", "error");
            response.put("message", "Invalid Password");
            return response;
        }

        // Extract roles
        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        // Generate JWT with roles
        String token = jwtService.generateToken(user.getEmail(), roles);

        // Send token & user details
        response.put("status", "success");
        response.put("token", token);
        response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getFullName(),
                "email", user.getEmail(),
                "roles", roles
        ));

        return response;
    }

    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        Map<String, Object> response = new HashMap<>();
        
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null) {
            response.put("status", "error");
            response.put("message", "Email not found");
            return response;
        }

        // Delete existing tokens for this user
        passwordResetTokenRepository.deleteByUser(user);

        // Generate new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(token);
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1)); // 1 hour expiry

        passwordResetTokenRepository.save(resetToken);

        // Send password reset email
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);
            response.put("status", "success");
            response.put("message", "Password reset instructions have been sent to your email address.");
        } catch (Exception e) {
            // If email fails, still return success but with different message
            System.err.println("Failed to send password reset email: " + e.getMessage());
            response.put("status", "success");
            response.put("message", "Password reset token generated, but email delivery failed. Please contact support.");
            // In development, still provide the token
            response.put("token", token);
        }
        
        return response;
    }

    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody ResetPasswordRequest req) {
        Map<String, Object> response = new HashMap<>();
        
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenAndUsedFalse(req.getToken()).orElse(null);
        
        if (resetToken == null || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            response.put("status", "error");
            response.put("message", "Invalid or expired token");
            return response;
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        response.put("status", "success");
        response.put("message", "Password reset successfully");
        return response;
    }
}
