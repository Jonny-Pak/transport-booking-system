package com.transport.ticketbooking.modules.auth.service;

import com.transport.ticketbooking.common.exception.ApiException;
import com.transport.ticketbooking.modules.auth.dto.RegisterRequest;
import com.transport.ticketbooking.modules.auth.dto.UserResponse;
import com.transport.ticketbooking.modules.user.entity.User;
import com.transport.ticketbooking.modules.user.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        validatePasswordLength(request.password());
        if (users.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email đã được sử dụng.");
        }
        User user = new User(request.fullName(), request.email(),
                passwordEncoder.encode(request.password()), request.phone());
        try {
            users.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            // The unique database constraint also protects concurrent registrations.
            throw new ApiException(HttpStatus.CONFLICT, "Không thể tạo tài khoản. Email có thể đã được sử dụng.");
        }
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(String email) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không còn hợp lệ."));
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không còn hợp lệ.");
        }
        return UserResponse.from(user);
    }

    public void validatePasswordLength(String password) {
        // BCrypt accepts at most 72 bytes, which differs from 72 Unicode characters.
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu không được vượt quá 72 byte UTF-8.");
        }
    }
}
