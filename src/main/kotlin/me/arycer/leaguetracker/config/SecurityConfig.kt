package me.arycer.leaguetracker.config

import me.arycer.leaguetracker.auth.ClerkJwtAuthFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
class SecurityConfig(
    private val clerkJwtAuthFilter: ClerkJwtAuthFilter
) {

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .cors { }
            .authorizeHttpRequests { auth ->
                auth.requestMatchers("/api/lol/version/**").permitAll()
                auth.requestMatchers("/api/chat/**").authenticated()
                auth.requestMatchers("/api/friends/**").authenticated()
                auth.requestMatchers("/api/lol/accounts/**").authenticated()
                auth.requestMatchers("/ws/**").authenticated()

                // Resto de endpoints bloqueados
                auth.anyRequest().permitAll()
            }
            .addFilterBefore(clerkJwtAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
            .httpBasic { it.disable() }
            .formLogin { it.disable() }


        return http.build()
    }
}
