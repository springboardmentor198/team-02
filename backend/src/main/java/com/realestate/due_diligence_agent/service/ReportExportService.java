package com.realestate.due_diligence_agent.service;

public interface ReportExportService {
    byte[] exportPdf(Long propertyId);
    byte[] exportExcel(Long propertyId);
}
