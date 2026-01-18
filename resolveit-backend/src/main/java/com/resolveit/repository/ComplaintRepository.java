package com.resolveit.repository;

import com.resolveit.model.Complaint;
import com.resolveit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);
    List<Complaint> findByAssignedOfficerOrderByCreatedAtDesc(User officer);
    
    @Query("SELECT c FROM Complaint c WHERE c.assignedOfficer IS NULL ORDER BY c.createdAt DESC")
    List<Complaint> findUnassignedComplaints();
    
    @Query("SELECT c FROM Complaint c WHERE c.status.code = :statusCode ORDER BY c.createdAt DESC")
    List<Complaint> findByStatusCode(@Param("statusCode") String statusCode);
    
    // For escalation
    @Query("SELECT c FROM Complaint c WHERE c.createdAt < :thresholdTime AND c.status.code != :statusCode")
    List<Complaint> findByCreatedAtBeforeAndStatusCodeNot(
        @Param("thresholdTime") LocalDateTime thresholdTime,
        @Param("statusCode") String statusCode
    );
    
    // For reports
    List<Complaint> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // User-specific report methods
    List<Complaint> findByAssignedOfficer(User officer);
    List<Complaint> findByAssignedOfficerAndCreatedAtBetween(User officer, LocalDateTime startDate, LocalDateTime endDate);
}