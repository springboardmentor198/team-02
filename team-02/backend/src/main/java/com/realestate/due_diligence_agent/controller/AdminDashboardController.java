package com.realestate.due_diligence_agent.controller;

import com.realestate.due_diligence_agent.dto.AdminDashboardResponse;
import com.realestate.due_diligence_agent.service.AdminDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    public AdminDashboardResponse getAdminDashboard() {
        return adminDashboardService.getAdminDashboard();
    }
}