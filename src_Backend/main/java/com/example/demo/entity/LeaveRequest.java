package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@Table(name = "leave_requests")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER) // Changed to EAGER
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private String feedback;

    public LeaveRequest(User user, LocalDate startDate, LocalDate endDate, String reason) {
        this.user = user;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.status = "PENDING";
    }
}