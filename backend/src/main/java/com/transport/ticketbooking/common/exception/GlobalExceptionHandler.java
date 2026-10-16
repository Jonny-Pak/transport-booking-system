package com.transport.ticketbooking.common.exception;

import com.transport.ticketbooking.common.response.ApiResponse;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.ErrorResponse;
import org.springframework.security.core.AuthenticationException;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> api(ApiException exception) {
        return ResponseEntity.status(exception.getStatus()).body(ApiResponse.error(exception.getMessage(), null));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> authentication(AuthenticationException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Email hoặc mật khẩu không đúng, hoặc tài khoản không khả dụng.", null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> validation(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(ApiResponse.error("Thông tin nhập chưa hợp lệ. Vui lòng kiểm tra lại.", errors));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, ConstraintViolationException.class})
    public ResponseEntity<ApiResponse<Void>> badRequest(Exception exception) {
        return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request", null));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Void>> notFound(NoResourceFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Resource not found", null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> unexpected(Exception exception) {
        if (exception instanceof ErrorResponse error) {
            return ResponseEntity.status(error.getStatusCode()).body(ApiResponse.error("Request could not be processed", null));
        }
        log.error("Unexpected request failure", exception);
        return ResponseEntity.internalServerError().body(ApiResponse.error("An unexpected error occurred", null));
    }
}
