package com.realestate.due_diligence_agent.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;

    public SecurityConfig(JwtFilter jwtFilter,
            JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
            JwtAccessDeniedHandler jwtAccessDeniedHandler) {
        this.jwtFilter = jwtFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
        this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth

                        // Public APIs
                        .requestMatchers("/api/auth/**").permitAll()
                        // Uploaded profile photos are served as plain static files so
                        // <img src="..."> can load them directly (no way to attach the
                        // JWT Authorization header to an <img> request). Filenames are
                        // randomised (UUID) so this isn't meaningfully enumerable.
                        .requestMatchers("/uploads/**").permitAll()

                        // Role Based APIs
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // System-wide audit log is administrator-only. Enforced here (not
                        // just hidden in the sidebar) so a BUYER hitting the endpoint
                        // directly still gets a 403, same convention as /api/admin/**.
                        .requestMatchers("/api/audit-logs/**").hasRole("ADMIN")
                        .requestMatchers("/api/buyer/**").hasRole("BUYER")
                        .requestMatchers("/api/agent/**").hasRole("AGENT")
                        .requestMatchers("/api/legal/**").hasRole("LEGAL_REVIEWER")
                        .requestMatchers("/api/bank/**").hasRole("FINANCIAL_INSTITUTION")

                        // Everything else
                        .anyRequest().authenticated())

                        .httpBasic(httpBasic -> httpBasic.disable())

                        .exceptionHandling(exceptions -> exceptions
                                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                                .accessDeniedHandler(jwtAccessDeniedHandler))

                .addFilterBefore(jwtFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:5176"));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS"));

        configuration.setAllowedHeaders(List.of("*"));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}