package com.transport.ticketbooking.modules.auth.dto;

import jakarta.validation.constraints.*;
import java.util.Locale;

public record RegisterRequest(
        @NotBlank @Size(max = 150) String fullName,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @Pattern(regexp = "^$|[+0-9() .-]{8,25}", message = "Số điện thoại không hợp lệ") String phone) {
    public RegisterRequest {
        fullName = fullName == null ? null : fullName.trim();
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        phone = phone == null || phone.isBlank() ? null : phone.trim();
    }
}
