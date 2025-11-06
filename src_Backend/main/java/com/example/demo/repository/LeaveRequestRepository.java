package com.example.demo.repository;

import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByUser(User user);
    List<LeaveRequest> findByStatus(String status);
    List<LeaveRequest> findByStatusAndUserIn(String status, List<User> users);
}