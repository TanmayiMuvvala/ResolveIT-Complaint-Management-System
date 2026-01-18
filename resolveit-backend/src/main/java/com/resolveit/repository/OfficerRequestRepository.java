package com.resolveit.repository;

import com.resolveit.model.OfficerRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfficerRequestRepository extends JpaRepository<OfficerRequest, Long> {
    
    List<OfficerRequest> findByStatusOrderByRequestedAtDesc(String status);
    
    List<OfficerRequest> findByUserIdOrderByRequestedAtDesc(Long userId);
    
    Optional<OfficerRequest> findByUserIdAndStatus(Long userId, String status);
    
    boolean existsByUserIdAndStatus(Long userId, String status);
}
