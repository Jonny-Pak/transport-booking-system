package com.transport.ticketbooking.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transport.ticketbooking.common.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfAuthenticationStrategy;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.security.web.authentication.session.CompositeSessionAuthenticationStrategy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, Environment environment, ObjectMapper mapper,
                                           SecurityContextRepository contextRepository,
                                           CsrfTokenRepository csrfRepository) throws Exception {
        http.cors(cors -> {})
            .csrf(csrf -> csrf.csrfTokenRepository(csrfRepository))
            .securityContext(context -> context.securityContextRepository(contextRepository))
            .requestCache(cache -> cache.disable())
            .authorizeHttpRequests(authorize -> {
            authorize.requestMatchers(HttpMethod.GET, "/api/v1/health", "/actuator/health", "/api/v1/auth/csrf").permitAll();
            authorize.requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login").permitAll();
            if (environment.acceptsProfiles(Profiles.of("local"))) {
                authorize.requestMatchers(HttpMethod.GET, "/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**", "/v3/api-docs.yaml").permitAll();
            }
            authorize.requestMatchers("/api/v1/admin/**").hasRole("ADMIN");
            authorize.requestMatchers("/api/v1/customer/**").hasRole("CUSTOMER");
            authorize.anyRequest().authenticated();
        }).exceptionHandling(errors -> errors
                .authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(401);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    mapper.writeValue(response.getOutputStream(), ApiResponse.error("Vui lòng đăng nhập để tiếp tục.", null));
                })
                .accessDeniedHandler((request, response, exception) -> {
                    response.setStatus(403);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    mapper.writeValue(response.getOutputStream(), ApiResponse.error("Bạn không có quyền truy cập hoặc mã CSRF không hợp lệ.", null));
                }))
            .logout(logout -> logout.logoutUrl("/api/v1/auth/logout")
                .deleteCookies("JSESSIONID")
                .logoutSuccessHandler((request, response, authentication) -> {
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    mapper.writeValue(response.getOutputStream(), ApiResponse.success("Đã đăng xuất.", null));
                }));
        return http.build();
    }

    @Bean
    SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    CsrfTokenRepository csrfTokenRepository() {
        return new HttpSessionCsrfTokenRepository();
    }

    @Bean
    SessionAuthenticationStrategy sessionAuthenticationStrategy(CsrfTokenRepository csrfRepository) {
        return new CompositeSessionAuthenticationStrategy(List.of(
                new ChangeSessionIdAuthenticationStrategy(), new CsrfAuthenticationStrategy(csrfRepository)));
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") String origins) {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Authorization", "X-CSRF-TOKEN"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
