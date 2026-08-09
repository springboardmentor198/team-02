package com.realestate.due_diligence_agent.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.realestate.due_diligence_agent.entity.AuditLog;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>,
        JpaSpecificationExecutor<AuditLog> {

    List<AuditLog> findByUserId(Long userId);

    List<AuditLog> findByPropertyId(Long propertyId);

    long countByStatus(String status);

    long countByActionTimeGreaterThanEqual(LocalDateTime from);

}
