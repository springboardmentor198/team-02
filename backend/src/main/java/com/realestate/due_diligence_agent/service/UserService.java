package com.realestate.due_diligence_agent.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.realestate.due_diligence_agent.dto.AuthResponse;
import com.realestate.due_diligence_agent.dto.ChangePasswordRequest;
import com.realestate.due_diligence_agent.dto.ForgotPasswordRequest;
import com.realestate.due_diligence_agent.dto.LoginRequest;
import com.realestate.due_diligence_agent.dto.RegisterRequest;
import com.realestate.due_diligence_agent.dto.ResetPasswordRequest;
import com.realestate.due_diligence_agent.dto.UpdateProfileRequest;
import com.realestate.due_diligence_agent.dto.VerifyOtpRequest;
import com.realestate.due_diligence_agent.entity.OtpToken;
import com.realestate.due_diligence_agent.entity.AuditLog;
import com.realestate.due_diligence_agent.entity.User;
import com.realestate.due_diligence_agent.exception.BadRequestException;
import com.realestate.due_diligence_agent.exception.ResourceNotFoundException;
import com.realestate.due_diligence_agent.exception.UnauthorizedException;
import com.realestate.due_diligence_agent.repository.OtpRepository;
import com.realestate.due_diligence_agent.repository.UserRepository;
import com.realestate.due_diligence_agent.security.JwtService;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    @Value("${app.upload.profile-images-dir}")
    private String profileImagesDir;

    private static final Set<String> ALLOWED_IMAGE_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024; // 5MB

    public UserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            OtpRepository otpRepository,
            EmailService emailService,
            AuditLogService auditLogService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.auditLogService = auditLogService;
    }

    public User register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists!");
        }

        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        return userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {

        User user;
        try {
            user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } catch (ResourceNotFoundException ex) {
            logLoginAttempt(null, request.getEmail(), null, "FAILED", "No account found for this email.");
            throw ex;
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            logLoginAttempt(user.getId(), user.getFullName(), user.getRole().name(),
                    "FAILED", "Incorrect password.");
            throw new UnauthorizedException("Invalid password");
        }

        String token = jwtService.generateToken(user.getEmail());

        logLoginAttempt(user.getId(), user.getFullName(), user.getRole().name(),
                "SUCCESS", "User logged in.");

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getRole().name()
        );
    }

    private void logLoginAttempt(Long userId, String username, String role, String status, String description) {
        try {
            AuditLog entry = new AuditLog();
            entry.setUserId(userId);
            entry.setUsername(username);
            entry.setRole(role);
            entry.setAction("LOGIN");
            entry.setModule("Auth");
            entry.setEntityType("USER");
            entry.setEntityId(userId);
            entry.setStatus(status);
            entry.setDescription(description);
            auditLogService.record(entry);
        } catch (Exception ignored) {
            // A logging failure should never block or fail a login attempt.
        }
    }

    public User getLoggedInUser() {

        Authentication authentication
                = SecurityContextHolder.getContext().getAuthentication();

        return (User) authentication.getPrincipal();
    }

    public User updateProfile(UpdateProfileRequest request) {

        User user = getLoggedInUser();

        userRepository.findByEmail(request.getEmail().trim())
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(user.getId())) {
                        throw new BadRequestException("Email is already in use.");
                    }
                });

        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());

        return userRepository.save(user);
    }

    public void changePassword(ChangePasswordRequest request) {

        User user = getLoggedInUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("Current password is incorrect.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password cannot be the same as the current password.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Forgot Password
    public void forgotPassword(ForgotPasswordRequest request) {

        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        otpRepository.deleteByEmail(request.getEmail());

        String otp = String.format("%06d", new Random().nextInt(1000000));

        OtpToken token = new OtpToken(
                request.getEmail(),
                otp,
                LocalDateTime.now().plusMinutes(10));

        otpRepository.save(token);
        emailService.sendOtp(request.getEmail(), otp);
    }

    public void verifyOtp(VerifyOtpRequest request) {

        OtpToken token = otpRepository.findByEmailAndOtp(
                request.getEmail(),
                request.getOtp())
                .orElseThrow(() -> new BadRequestException("Invalid OTP"));

        if (token.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }
    }

    public void resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        otpRepository.deleteByEmail(request.getEmail());
    }

    // ==========================
    // Profile Photo (Requested Change 4)
    // ==========================
    // Stored on local disk under app.upload.profile-images-dir, matching the
    // rest of this project's footprint -- no external storage service. See
    // WebConfig for how the directory is exposed back out over HTTP.
    public User uploadProfilePhoto(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was uploaded.");
        }
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPEG, PNG, or WEBP images are allowed.");
        }
        if (file.getSize() > MAX_IMAGE_BYTES) {
            throw new BadRequestException("Image must be smaller than 5MB.");
        }

        User user = getLoggedInUser();

        try {
            Path dir = Paths.get(profileImagesDir);
            Files.createDirectories(dir);

            String extension = switch (file.getContentType()) {
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                default -> ".jpg";
            };
            String filename = user.getId() + "-" + UUID.randomUUID() + extension;
            Path target = dir.resolve(filename);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // Clean up the previous file so uploads don't accumulate.
            deleteExistingPhotoFile(user);

            user.setProfileImagePath(filename);
            return userRepository.save(user);

        } catch (IOException ex) {
            throw new BadRequestException("Couldn't save the uploaded image. Please try again.");
        }
    }

    public User removeProfilePhoto() {
        User user = getLoggedInUser();
        deleteExistingPhotoFile(user);
        user.setProfileImagePath(null);
        return userRepository.save(user);
    }

    private void deleteExistingPhotoFile(User user) {
        if (user.getProfileImagePath() == null) {
            return;
        }
        try {
            Files.deleteIfExists(Paths.get(profileImagesDir).resolve(user.getProfileImagePath()));
        } catch (IOException ignored) {
            // Non-fatal -- an orphaned file on disk isn't worth failing the request over.
        }
    }

    // Public URL the frontend can drop straight into <img src>. WebConfig
    // maps /uploads/profile-images/** back to profileImagesDir on disk.
    public String getProfileImageUrl(User user) {
        if (user.getProfileImagePath() == null) {
            return null;
        }
        return "/uploads/profile-images/" + user.getProfileImagePath();
    }
}
