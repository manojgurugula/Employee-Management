package com.example.demo.controller;

import com.example.demo.entity.LeaveRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.LeaveRequestRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:3000")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/apply/{userId}")
    public ResponseEntity<String> applyLeave(@PathVariable Long userId, @RequestBody LeaveRequest leaveRequest) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        leaveRequest.setUser(user);
        leaveService.applyLeave(leaveRequest);
        return ResponseEntity.ok("Leave request submitted successfully.");
    }

    @GetMapping("/my-leaves/{userId}")
    public ResponseEntity<List<LeaveRequest>> getMyLeaves(@PathVariable Long userId) {
        return ResponseEntity.ok(leaveService.getUserLeaveHistory(userId));
    }

    @GetMapping("/pending/{managerId}")
    public ResponseEntity<List<LeaveRequest>> getPendingLeaves(@PathVariable Long managerId) {
        return ResponseEntity.ok(leaveService.getPendingLeaveRequestsForManager(managerId));
    }

    @PatchMapping("/{leaveId}")
    public ResponseEntity<String> updateLeaveStatus(@PathVariable Long leaveId, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        String feedback = payload.get("feedback");
        
        if (status == null || (!status.equalsIgnoreCase("APPROVED") && !status.equalsIgnoreCase("REJECTED"))) {
            return ResponseEntity.badRequest().body("Invalid status.");
        }

        try {
            leaveService.updateLeaveStatus(leaveId, status, feedback);
            return ResponseEntity.ok("Leave status updated.");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}