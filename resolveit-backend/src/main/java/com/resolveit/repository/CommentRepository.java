package com.resolveit.repository;

import com.resolveit.model.Comment;
import com.resolveit.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByComplaintOrderByCreatedAtAsc(Complaint complaint);
    List<Comment> findByComplaintAndIsPrivateFalseOrderByCreatedAtAsc(Complaint complaint);
}