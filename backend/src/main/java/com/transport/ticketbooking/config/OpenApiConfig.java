package com.transport.ticketbooking.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("local")
public class OpenApiConfig {
    @Bean
    OpenAPI ticketBookingOpenApi() {
        return new OpenAPI().info(new Info().title("Transport Ticket Booking API")
                .version("v1").description("Initialization foundation. Business APIs are not implemented yet."));
    }
}
