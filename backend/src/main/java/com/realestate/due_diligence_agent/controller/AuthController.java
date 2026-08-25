package com.realestate.due_diligence_agent.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.realestate.due_diligence_agent.dto.AuthResponse;
import com.realestate.due_diligence_agent.dto.ForgotPasswordRequest;
import com.realestate.due_diligence_agent.dto.LoginRequest;
import com.realestate.due_diligence_agent.dto.RegisterRequest;
import com.realestate.due_diligence_agent.dto.ResetPasswordRequest;
import com.realestate.due_diligence_agent.dto.VerifyOtpRequest;
import com.realestate.due_diligence_agent.entity.User;
import com.realestate.due_diligence_agent.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@Valid @RequestBody RegisterRequest request) {
        User savedUser = userService.register(request);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request);
        return ResponseEntity.ok("OTP sent successfully.");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        userService.verifyOtp(request);
        return ResponseEntity.ok("OTP verified successfully.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return ResponseEntity.ok("Password reset successfully.");
    }
}
