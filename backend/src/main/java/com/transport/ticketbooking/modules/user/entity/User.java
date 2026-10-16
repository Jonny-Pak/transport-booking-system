package com.transport.ticketbooking.modules.user.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String fullName;
    @Column(nullable = false, unique = true, length = 254)
    private String email;
    @Column(nullable = false, length = 255)
    private String passwordHash;
    @Column(length = 25)
    private String phone;
    @Column(nullable = false, length = 20)
    private String role;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(nullable = false)
    private Instant createdAt;
    @Column(nullable = false)
    private Instant updatedAt;

    protected User() {
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public User(String fullName, String email, String passwordHash, String phone) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.role = "CUSTOMER";
        this.status = "ACTIVE";
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }
}
