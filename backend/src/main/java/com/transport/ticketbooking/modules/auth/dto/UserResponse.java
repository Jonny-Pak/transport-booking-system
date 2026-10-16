package com.transport.ticketbooking.modules.auth.dto;

import com.transport.ticketbooking.modules.user.entity.User;

public record UserResponse(Long id, String fullName, String email, String phone, String role) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole());
    }
}
