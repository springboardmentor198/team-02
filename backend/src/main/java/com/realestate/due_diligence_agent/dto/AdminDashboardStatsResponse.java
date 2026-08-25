package com.realestate.due_diligence_agent.dto;

import java.util.Map;

// Backs the Admin Dashboard's stat cards + charts. Every number here comes
// from a real repository count — nothing is hardcoded — except
// systemHealth/apiUptimePercent, which this application has no monitoring
// integration to source yet and are documented as such below.
public class AdminDashboardStatsResponse {

    private long totalUsers;
    private Map<String, Long> usersByRole;
    private long totalProperties;
    private long totalReports;
    private long reportsLast7Days;
    private long pendingReports;
    private long totalAuditLogs;
    private long auditEventsLast24h;
    private long failedAuditEvents;

    // No APM/infra monitoring is wired into this app yet, so these two
    // fields are the only non-derived values in this response — surfaced
    // clearly as "system health" rather than folded into the real counts
    // above so nobody mistakes them for measured data.
    private String systemHealth;
    private double apiUptimePercent;

    public AdminDashboardStatsResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Map<String, Long> getUsersByRole() {
        return usersByRole;
    }

    public void setUsersByRole(Map<String, Long> usersByRole) {
        this.usersByRole = usersByRole;
    }

    public long getTotalProperties() {
        return totalProperties;
    }

    public void setTotalProperties(long totalProperties) {
        this.totalProperties = totalProperties;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getReportsLast7Days() {
        return reportsLast7Days;
    }

    public void setReportsLast7Days(long reportsLast7Days) {
        this.reportsLast7Days = reportsLast7Days;
    }

    public long getPendingReports() {
        return pendingReports;
    }

    public void setPendingReports(long pendingReports) {
        this.pendingReports = pendingReports;
    }

    public long getTotalAuditLogs() {
        return totalAuditLogs;
    }

    public void setTotalAuditLogs(long totalAuditLogs) {
        this.totalAuditLogs = totalAuditLogs;
    }

    public long getAuditEventsLast24h() {
        return auditEventsLast24h;
    }

    public void setAuditEventsLast24h(long auditEventsLast24h) {
        this.auditEventsLast24h = auditEventsLast24h;
    }

    public long getFailedAuditEvents() {
        return failedAuditEvents;
    }

    public void setFailedAuditEvents(long failedAuditEvents) {
        this.failedAuditEvents = failedAuditEvents;
    }

    public String getSystemHealth() {
        return systemHealth;
    }

    public void setSystemHealth(String systemHealth) {
        this.systemHealth = systemHealth;
    }

    public double getApiUptimePercent() {
        return apiUptimePercent;
    }

    public void setApiUptimePercent(double apiUptimePercent) {
        this.apiUptimePercent = apiUptimePercent;
    }
}
