package com.realestate.due_diligence_agent.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.realestate.due_diligence_agent.entity.DueDiligenceReport;

@Repository
public interface DueDiligenceReportRepository extends JpaRepository<DueDiligenceReport, Long>,
        JpaSpecificationExecutor<DueDiligenceReport> {

    List<DueDiligenceReport> findByPropertyId(Long propertyId);

    // Most recent report for a property — used by ExportController to know
    // which report-history row a PDF/Excel download against a propertyId
    // should update (download count, file size, last accessed).
    DueDiligenceReport findFirstByPropertyIdOrderByGeneratedAtDesc(Long propertyId);

    long countByStatus(String status);

    long countByGeneratedAtGreaterThanEqual(LocalDateTime from);

}
