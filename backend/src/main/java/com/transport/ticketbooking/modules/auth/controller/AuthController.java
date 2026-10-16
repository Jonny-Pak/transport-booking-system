package com.transport.ticketbooking.modules.auth.controller;

import com.transport.ticketbooking.common.response.ApiResponse;
import com.transport.ticketbooking.modules.auth.dto.*;
import com.transport.ticketbooking.modules.auth.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SessionAuthenticationStrategy sessionAuthenticationStrategy;

    public AuthController(AuthService authService, AuthenticationManager authenticationManager,
                          SecurityContextRepository securityContextRepository,
                          SessionAuthenticationStrategy sessionAuthenticationStrategy) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.sessionAuthenticationStrategy = sessionAuthenticationStrategy;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Đăng ký thành công. Bạn có thể đăng nhập.", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<UserResponse> login(@Valid @RequestBody LoginRequest body,
                                          HttpServletRequest request, HttpServletResponse response) {
        authService.validatePasswordLength(body.password());
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(body.email(), body.password()));
        // Rotate the session ID and CSRF token before persisting authentication.
        sessionAuthenticationStrategy.onAuthentication(authentication, request, response);
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        return ApiResponse.success("Đăng nhập thành công.", authService.currentUser(authentication.getName()));
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(Authentication authentication) {
        return ApiResponse.success("Thông tin tài khoản.", authService.currentUser(authentication.getName()));
    }

    @GetMapping("/csrf")
    public ApiResponse<CsrfResponse> csrf(CsrfToken token) {
        return ApiResponse.success("CSRF token", new CsrfResponse(token.getHeaderName(), token.getToken()));
    }

    public record CsrfResponse(String headerName, String token) {}
}
