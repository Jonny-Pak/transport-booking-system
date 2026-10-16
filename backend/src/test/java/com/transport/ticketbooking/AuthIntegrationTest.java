package com.transport.ticketbooking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.DriverManager;
import java.util.Map;
import java.util.TimeZone;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Import(AuthIntegrationTest.ProbeConfig.class)
@EnabledIfEnvironmentVariable(named = "MIGRATION_TEST_DB_URL", matches = ".+")
class AuthIntegrationTest {
    private static final String SCHEMA = "auth_test_" + UUID.randomUUID().toString().replace("-", "");
    private static TimeZone originalTimeZone;
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper mapper;
    @Autowired JdbcTemplate jdbc;
    @Autowired PasswordEncoder encoder;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry properties) {
        String url = System.getenv("MIGRATION_TEST_DB_URL");
        properties.add("spring.datasource.url", () -> url + (url.contains("?") ? "&" : "?") + "currentSchema=" + SCHEMA);
        properties.add("spring.datasource.username", () -> System.getenv("MIGRATION_TEST_DB_USER"));
        properties.add("spring.datasource.password", () -> System.getenv("MIGRATION_TEST_DB_PASSWORD"));
        properties.add("spring.flyway.schemas", () -> SCHEMA);
        properties.add("spring.flyway.default-schema", () -> SCHEMA);
    }

    @BeforeAll
    static void useUtc() {
        originalTimeZone = TimeZone.getDefault();
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }

    @AfterAll
    static void cleanup() throws Exception {
        try (var connection = DriverManager.getConnection(System.getenv("MIGRATION_TEST_DB_URL"),
                System.getenv("MIGRATION_TEST_DB_USER"), System.getenv("MIGRATION_TEST_DB_PASSWORD"));
             var statement = connection.createStatement()) {
            statement.execute("DROP SCHEMA IF EXISTS " + SCHEMA + " CASCADE");
        } finally {
            TimeZone.setDefault(originalTimeZone);
        }
    }

    @Test
    void registrationNormalizesEmailHashesPasswordAndIgnoresRoleInjection() throws Exception {
        String email = email();
        Csrf csrf = csrf(null);
        mvc.perform(post("/api/v1/auth/register").session(csrf.session()).header(csrf.header(), csrf.token())
                .contentType("application/json").content(mapper.writeValueAsString(Map.of(
                        "fullName", "  Nguyễn Văn An  ", "email", "  " + email.toUpperCase() + "  ",
                        "password", "Password123!", "role", "ADMIN", "status", "LOCKED"))))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.email").value(email))
                .andExpect(jsonPath("$.data.fullName").value("Nguyễn Văn An"))
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());
        String hash = jdbc.queryForObject("SELECT password_hash FROM users WHERE email=?", String.class, email);
        assertNotEquals("Password123!", hash);
        assertTrue(encoder.matches("Password123!", hash));
        mvc.perform(get("/api/v1/auth/me").session(csrf.session())).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/auth/register").session(csrf.session()).header(csrf.header(), csrf.token())
                .contentType("application/json").content(registration(email, "Password123!")))
                .andExpect(status().isConflict());
    }

    @Test
    void validatesInputAndBcryptByteLimit() throws Exception {
        Csrf csrf = csrf(null);
        for (String password : new String[]{"short", "é".repeat(40)}) {
            mvc.perform(post("/api/v1/auth/register").session(csrf.session()).header(csrf.header(), csrf.token())
                    .contentType("application/json").content(registration(email(), password)))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/v1/auth/register").session(csrf.session()).header(csrf.header(), csrf.token())
                .contentType("application/json").content(registration("invalid-email", "Password123!")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginRotatesSessionAndCsrfAndLogoutInvalidatesSession() throws Exception {
        String email = createAccount();
        Csrf before = csrf(null);
        String oldId = before.session().getId();
        MvcResult login = login(email, "Password123!", before).andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) login.getRequest().getSession(false);
        assertNotEquals(oldId, session.getId());
        mvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.email").value(email));
        mvc.perform(post("/api/v1/auth/logout").session(session).header(before.header(), before.token()))
                .andExpect(status().isForbidden());
        Csrf after = csrf(session);
        mvc.perform(post("/api/v1/auth/logout").session(session).header(after.header(), after.token()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
        assertTrue(session.isInvalid());
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordUnknownAndLockedAccountsCannotLogin() throws Exception {
        String email = createAccount();
        login(email, "wrong-password", csrf(null)).andExpect(status().isUnauthorized());
        login(email(), "Password123!", csrf(null)).andExpect(status().isUnauthorized());
        jdbc.update("UPDATE users SET status='LOCKED' WHERE email=?", email);
        login(email, "Password123!", csrf(null)).andExpect(status().isUnauthorized());
    }

    @Test
    void enforcesCustomerAndAdminRolesAtBackend() throws Exception {
        mvc.perform(get("/api/v1/admin/auth-test")).andExpect(status().isUnauthorized());
        String email = createAccount();
        MockHttpSession customer = authenticated(email);
        mvc.perform(get("/api/v1/admin/auth-test").session(customer)).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/customer/auth-test").session(customer)).andExpect(status().isOk());
        jdbc.update("UPDATE users SET role='ADMIN' WHERE email=?", email);
        MockHttpSession admin = authenticated(email);
        mvc.perform(get("/api/v1/admin/auth-test").session(admin)).andExpect(status().isOk());
        mvc.perform(get("/api/v1/customer/auth-test").session(admin)).andExpect(status().isForbidden());
    }

    @Test
    void csrfRequiredForRegistrationLoginAndLogout() throws Exception {
        mvc.perform(post("/api/v1/auth/register").contentType("application/json").content(registration(email(), "Password123!")))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/auth/login").contentType("application/json").content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/v1/auth/logout")).andExpect(status().isForbidden());
    }

    @Test
    void corsAllowsCredentialsOnlyForConfiguredOrigin() throws Exception {
        mvc.perform(options("/api/v1/auth/login").header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "content-type,x-csrf-token"))
                .andExpect(status().isOk()).andExpect(header().string("Access-Control-Allow-Credentials", "true"))
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
        mvc.perform(options("/api/v1/auth/login").header("Origin", "https://untrusted.example")
                .header("Access-Control-Request-Method", "POST")).andExpect(status().isForbidden());
    }

    private String createAccount() throws Exception {
        String email = email();
        Csrf csrf = csrf(null);
        mvc.perform(post("/api/v1/auth/register").session(csrf.session()).header(csrf.header(), csrf.token())
                .contentType("application/json").content(registration(email, "Password123!")))
                .andExpect(status().isCreated());
        return email;
    }

    private MockHttpSession authenticated(String email) throws Exception {
        return (MockHttpSession) login(email, "Password123!", csrf(null)).andExpect(status().isOk())
                .andReturn().getRequest().getSession(false);
    }

    private org.springframework.test.web.servlet.ResultActions login(String email, String password, Csrf csrf) throws Exception {
        return mvc.perform(post("/api/v1/auth/login").session(csrf.session()).header(csrf.header(), csrf.token())
                .contentType("application/json").content(mapper.writeValueAsString(Map.of("email", email, "password", password))));
    }

    private Csrf csrf(MockHttpSession session) throws Exception {
        var request = get("/api/v1/auth/csrf");
        if (session != null) request.session(session);
        MvcResult result = mvc.perform(request).andExpect(status().isOk()).andReturn();
        JsonNode data = mapper.readTree(result.getResponse().getContentAsString()).get("data");
        return new Csrf((MockHttpSession) result.getRequest().getSession(), data.get("headerName").asText(), data.get("token").asText());
    }

    private String registration(String email, String password) throws Exception {
        return mapper.writeValueAsString(Map.of("fullName", "Test User", "email", email, "password", password));
    }

    private String email() { return UUID.randomUUID() + "@example.com"; }
    private record Csrf(MockHttpSession session, String header, String token) {}

    // Test-only endpoints exercise the real filter chain without adding fake business APIs.
    @TestConfiguration
    static class ProbeConfig {
        @Bean ProbeController probeController() { return new ProbeController(); }
    }
    @RestController
    static class ProbeController {
        @GetMapping({"/api/v1/admin/auth-test", "/api/v1/customer/auth-test"})
        public Map<String, Boolean> probe() { return Map.of("success", true); }
    }
}
