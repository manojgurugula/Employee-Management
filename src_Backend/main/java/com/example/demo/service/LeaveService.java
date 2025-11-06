package com.example.demo.service;

import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.LeaveRequestRepository;
import com.example.demo.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private UserRepository userRepository;

    public LeaveRequest applyLeave(LeaveRequest request) {
        request.setStatus("PENDING");
        return leaveRequestRepository.save(request);
    }

    @Transactional
    public LeaveRequest updateLeaveStatus(Long leaveId, String status, String feedback) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new RuntimeException("Leave request not found"));
        leaveRequest.setStatus(status.toUpperCase());
        if (feedback != null && !feedback.trim().isEmpty()) {
            leaveRequest.setFeedback(feedback);
        }
        return leaveRequestRepository.save(leaveRequest);
    }

    public List<LeaveRequest> getPendingLeaveRequestsForManager(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        List<User> employees = manager.getEmployees();
        return leaveRequestRepository.findByStatusAndUserIn("PENDING", employees);
    }

    public List<LeaveRequest> getUserLeaveHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return leaveRequestRepository.findByUser(user);
    }
}