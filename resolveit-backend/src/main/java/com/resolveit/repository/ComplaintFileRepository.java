package com.resolveit.repository;

import com.resolveit.model.ComplaintFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintFileRepository extends JpaRepository<ComplaintFile, Long> {

    // Spring Data JPA will now correctly interpret this method
    List<ComplaintFile> findByComplaint_Id(Long complaintId);
}
