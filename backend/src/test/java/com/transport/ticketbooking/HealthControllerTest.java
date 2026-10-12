package com.transport.ticketbooking;

import com.transport.ticketbooking.common.response.HealthController;
import com.transport.ticketbooking.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = HealthController.class, properties = "app.cors.allowed-origins=http://localhost:5173")
@Import(SecurityConfig.class)
class HealthControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void healthIsPublicAndReturnsContract() throws Exception {
        mvc.perform(get("/api/v1/health")).andExpect(status().isOk())
                .andExpect(content().json("""
                        {"success":true,"message":"Transport Ticket Booking API is running","data":null}
                        """));
    }

    @Test
    void businessEndpointsRequireAuthentication() throws Exception {
        mvc.perform(get("/api/v1/bookings")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void documentationIsPrivateOutsideLocalProfile() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isUnauthorized());
    }

    @Test
    void mutationWithoutCsrfIsRejected() throws Exception {
        mvc.perform(post("/api/v1/bookings")).andExpect(status().isForbidden());
    }

    @Test
    void configuredOriginCanReadHealth() throws Exception {
        mvc.perform(get("/api/v1/health").header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void unknownOriginIsRejected() throws Exception {
        mvc.perform(get("/api/v1/health").header("Origin", "https://unknown.example"))
                .andExpect(status().isForbidden());
    }
}
