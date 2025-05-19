package me.arycer.leaguetracker.auth

import com.nimbusds.jose.JOSEException
import com.nimbusds.jose.JWSObject
import com.nimbusds.jose.JWSVerifier
import com.nimbusds.jose.crypto.RSASSAVerifier
import com.nimbusds.jose.jwk.JWK
import com.nimbusds.jose.jwk.JWKMatcher
import com.nimbusds.jose.jwk.JWKSelector
import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.source.RemoteJWKSet
import com.nimbusds.jose.proc.SecurityContext
import com.nimbusds.jwt.SignedJWT
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletException
import jakarta.servlet.http.Cookie
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import me.arycer.leaguetracker.entity.leaguetracker.User
import me.arycer.leaguetracker.repository.UserRepository
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter
import java.io.IOException
import java.net.URL
import java.text.ParseException
import java.time.Instant
import java.util.*

@Component
class ClerkJwtAuthFilter(
    private val userRepository: UserRepository
) : OncePerRequestFilter() {

    private val jwkSetUrl = URL("https://assured-hermit-45.clerk.accounts.dev/.well-known/jwks.json")
    private val jwkSet = RemoteJWKSet<SecurityContext>(jwkSetUrl)

    @Throws(ServletException::class, IOException::class)
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val token = getTokenFromRequest(request)

        if (token == null) {
            filterChain.doFilter(request, response)
            return
        }

        try {
            val signedJWT = SignedJWT.parse(token)

            val kid = signedJWT.header.keyID
            val jwkMatches = jwkSet.get(JWKSelector(JWKMatcher.forJWSHeader(signedJWT.header)), null)

            val matchingKey = jwkMatches.firstOrNull() as? JWK
                ?: throw JOSEException("No matching JWK found for kid: $kid")

            val publicKey = matchingKey.toRSAKey().toRSAPublicKey()
            val verifier: JWSVerifier = RSASSAVerifier(publicKey)

            if (!signedJWT.verify(verifier)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT signature")
                return
            }

            val claims = signedJWT.jwtClaimsSet
            val now = Date.from(Instant.now())

            val exp = claims.expirationTime
            if (exp == null || exp.before(now)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expired")
                return
            }

            val userId = claims.subject ?: throw JOSEException("No subject in JWT")
            if (!userRepository.existsById(userId)) {
                val user = User(userId)
                userRepository.save(user)
            }

            val authorities = listOf(SimpleGrantedAuthority("ROLE_USER")) // O lo que uses
            val authentication = UsernamePasswordAuthenticationToken(userId, null, authorities)
            SecurityContextHolder.getContext().authentication = authentication

            filterChain.doFilter(request, response)
        } catch (e: ParseException) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Malformed JWT")
        } catch (e: JOSEException) {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "JWT verification failed: ${e.message}")
        }
    }

    private fun getTokenFromRequest(request: HttpServletRequest): String? {
        request.cookies?.firstOrNull { it.name == "__session" }?.value?.let { return it }

        val authHeader = request.getHeader("Authorization")
        if (authHeader?.startsWith("Bearer ") == true) {
            return authHeader.removePrefix("Bearer ")
        }

        return null
    }
}
