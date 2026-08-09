package com.realestate.due_diligence_agent.dto;

public class AuditLogStatsResponse {

    private long totalActivities;
    private long successfulActions;
    private long failedAttempts;
    private long todayActivity;

    public AuditLogStatsResponse() {
    }

    public AuditLogStatsResponse(long totalActivities, long successfulActions,
            long failedAttempts, long todayActivity) {
        this.totalActivities = totalActivities;
        this.successfulActions = successfulActions;
        this.failedAttempts = failedAttempts;
        this.todayActivity = todayActivity;
    }

    public long getTotalActivities() {
        return totalActivities;
    }

    public void setTotalActivities(long totalActivities) {
        this.totalActivities = totalActivities;
    }

    public long getSuccessfulActions() {
        return successfulActions;
    }

    public void setSuccessfulActions(long successfulActions) {
        this.successfulActions = successfulActions;
    }

    public long getFailedAttempts() {
        return failedAttempts;
    }

    public void setFailedAttempts(long failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public long getTodayActivity() {
        return todayActivity;
    }

    public void setTodayActivity(long todayActivity) {
        this.todayActivity = todayActivity;
    }
}
