package com.realestate.due_diligence_agent.dto;

public class ReportHistoryStatsResponse {

    private long totalReports;
    private long completedReports;
    private long todayReports;

    public ReportHistoryStatsResponse() {
    }

    public ReportHistoryStatsResponse(long totalReports, long completedReports, long todayReports) {
        this.totalReports = totalReports;
        this.completedReports = completedReports;
        this.todayReports = todayReports;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getCompletedReports() {
        return completedReports;
    }

    public void setCompletedReports(long completedReports) {
        this.completedReports = completedReports;
    }

    public long getTodayReports() {
        return todayReports;
    }

    public void setTodayReports(long todayReports) {
        this.todayReports = todayReports;
    }
}
