package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "profiles")
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    private String phone;
    private String address;
    private String dateOfBirth;
    private String joinDate;
    private String department;
    private String position;
    private String emergencyContact;
    private String emergencyPhone;

    public Profile(User user) {
        this.user = user;
    }
}