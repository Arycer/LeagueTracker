package me.arycer.leaguetracker.auth

import com.nimbusds.jose.JOSEException
import com.nimbusds.jose.JWSVerifier
import com.nimbusds.jose.crypto.RSASSAVerifier
import com.nimbusds.jose.jwk.JWK
import com.nimbusds.jose.jwk.JWKMatcher
import com.nimbusds.jose.jwk.JWKSelector
import com.nimbusds.jose.jwk.source.RemoteJWKSet
import com.nimbusds.jose.proc.SecurityContext
import com.nimbusds.jwt.SignedJWT
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import me.arycer.leaguetracker.entity.User
import me.arycer.leaguetracker.repository.UserRepository
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.net.URL
import java.time.Instant
import java.util.*

@Component
class ClerkJwtAuthFilter(
    private val userRepository: UserRepository
) : OncePerRequestFilter() {

    private val jwkSetUrl = URL("https://clerk.lt.arycer.me/.well-known/jwks.json")
    private val jwkSet = RemoteJWKSet<SecurityContext>(jwkSetUrl)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = extractToken(request)
        if (token == null) {
            filterChain.doFilter(request, response)
            return
        }

        val jwt = runCatching { SignedJWT.parse(token) }.getOrElse {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Malformed JWT")
            return
        }

        val isValid = verifyToken(jwt)

        if (!isValid) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT signature")
            return
        }

        val claims = jwt.jwtClaimsSet
        val now = Date.from(Instant.now())

        if (claims.expirationTime?.before(now) != false) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired")
            return
        }

        val userId = claims.subject ?: run {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "No subject in JWT")
            return
        }

        val username = claims.getStringClaim("username")
        handleUserSync(userId, username)

        val auth = UsernamePasswordAuthenticationToken(userId, null, listOf(SimpleGrantedAuthority("ROLE_USER")))
        SecurityContextHolder.getContext().authentication = auth

        filterChain.doFilter(request, response)
    }

    private fun extractToken(request: HttpServletRequest): String? {
        val authHeader = request.getHeader("Authorization")
        return if (authHeader?.startsWith("Bearer ") == true) {
            authHeader.removePrefix("Bearer ")
        } else null
    }

    private fun verifyToken(jwt: SignedJWT): Boolean {
        val jwk = runCatching {
            jwkSet.get(JWKSelector(JWKMatcher.forJWSHeader(jwt.header)), null)
                .firstOrNull() as? JWK
        }.getOrNull() ?: return false

        val publicKey = runCatching { jwk.toRSAKey().toRSAPublicKey() }.getOrNull() ?: return false
        val verifier: JWSVerifier = RSASSAVerifier(publicKey)

        return runCatching { jwt.verify(verifier) }.getOrElse { false }
    }

    @Synchronized
    private fun handleUserSync(userId: String, username: String?) {
        if (username == null) {
            println("No username found in JWT claims for userId: $userId")
            return
        }

        val existingUser = userRepository.findById(userId).orElse(null)

        if (existingUser == null) {
            println("Creating new user: $username ($userId)")
            userRepository.save(User(userId, username))
        } else if (existingUser.username != username) {
            println("Updating username from ${existingUser.username} to $username")
            existingUser.username = username
            userRepository.save(existingUser)
        }
    }
}
