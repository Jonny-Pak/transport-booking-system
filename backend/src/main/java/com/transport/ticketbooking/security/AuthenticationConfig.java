package com.transport.ticketbooking.security;

import com.transport.ticketbooking.modules.user.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthenticationConfig {
    @Bean
    UserDetailsService userDetailsService(UserRepository users) {
        return email -> {
            var user = users.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
            return User.withUsername(user.getEmail())
                    .password(user.getPasswordHash())
                    .roles(user.getRole())
                    .disabled(!"ACTIVE".equals(user.getStatus()))
                    .build();
        };
    }

    @Bean
    AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder encoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(encoder);
        return new ProviderManager(provider);
    }
}
