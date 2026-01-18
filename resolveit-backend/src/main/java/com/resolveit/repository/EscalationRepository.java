package com.resolveit.repository;

import com.resolveit.model.Escalation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, Long> {
    
    List<Escalation> findByComplaintId(Long complaintId);
    
    List<Escalation> findByResolvedFalse();
    
    List<Escalation> findByEscalatedToRoleId(Long roleId);
}