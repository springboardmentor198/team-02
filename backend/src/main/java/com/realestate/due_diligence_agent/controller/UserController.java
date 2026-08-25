package com.realestate.due_diligence_agent.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.realestate.due_diligence_agent.dto.ChangePasswordRequest;
import com.realestate.due_diligence_agent.dto.ProfileResponse;
import com.realestate.due_diligence_agent.dto.UpdateProfileRequest;
import com.realestate.due_diligence_agent.entity.AuditLog;
import com.realestate.due_diligence_agent.entity.User;
import com.realestate.due_diligence_agent.service.AuditLogService;
import com.realestate.due_diligence_agent.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuditLogService auditLogService;

    public UserController(UserService userService, AuditLogService auditLogService) {
        this.userService = userService;
        this.auditLogService = auditLogService;
    }

    // ==========================
    // Get Logged In User Profile
    // ==========================
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {

        User user = userService.getLoggedInUser();

        ProfileResponse response = new ProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                userService.getProfileImageUrl(user)
        );

        return ResponseEntity.ok(response);
    }

    // ==========================
    // Update Profile
    // ==========================
    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @RequestBody UpdateProfileRequest request) {

        User updatedUser = userService.updateProfile(request);

        ProfileResponse response = new ProfileResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole().name(),
                userService.getProfileImageUrl(updatedUser)
        );

        return ResponseEntity.ok(response);
    }

    // ==========================
    // Upload / Replace Profile Photo (Requested Change 4)
    // ==========================
    @PostMapping("/profile/photo")
    public ResponseEntity<ProfileResponse> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file) {

        User updatedUser = userService.uploadProfilePhoto(file);

        ProfileResponse response = new ProfileResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole().name(),
                userService.getProfileImageUrl(updatedUser)
        );

        return ResponseEntity.ok(response);
    }

    // ==========================
    // Remove Profile Photo
    // ==========================
    @DeleteMapping("/profile/photo")
    public ResponseEntity<ProfileResponse> removeProfilePhoto() {

        User updatedUser = userService.removeProfilePhoto();

        ProfileResponse response = new ProfileResponse(
                updatedUser.getId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole().name(),
                userService.getProfileImageUrl(updatedUser)
        );

        return ResponseEntity.ok(response);
    }

    // ==========================
    // Change Password
    // ==========================
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request) {

        userService.changePassword(request);

        return ResponseEntity.ok("Password changed successfully.");
    }

    // ==========================
    // Logout (Task 7 audit trail)
    // ==========================
    // Deliberately not under /api/auth/** — that prefix is excluded from
    // JwtFilter (see SecurityConfig), so it would have no authenticated
    // user to attribute the LOGOUT to. This route goes through the filter
    // normally, so getLoggedInUser() resolves correctly. There's nothing to
    // invalidate server-side (tokens aren't stored), this just records who
    // logged out and when.
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {

        User user = userService.getLoggedInUser();

        AuditLog entry = new AuditLog();
        entry.setUserId(user.getId());
        entry.setUsername(user.getFullName());
        entry.setRole(user.getRole().name());
        entry.setAction("LOGOUT");
        entry.setModule("Auth");
        entry.setEntityType("USER");
        entry.setEntityId(user.getId());
        entry.setStatus("SUCCESS");
        entry.setDescription("User logged out.");

        auditLogService.record(entry);

        return ResponseEntity.ok("Logged out successfully.");
    }
}
