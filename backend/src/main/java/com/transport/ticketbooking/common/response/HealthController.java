package com.transport.ticketbooking.common.response;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/api/v1/health")
    public ApiResponse<Void> health() {
        return ApiResponse.success("Transport Ticket Booking API is running", null);
    }
}
