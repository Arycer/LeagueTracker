package me.arycer.leaguetracker.service

import com.nimbusds.jose.crypto.RSASSAVerifier
import com.nimbusds.jose.jwk.JWK
import com.nimbusds.jose.jwk.JWKMatcher
import com.nimbusds.jose.jwk.JWKSelector
import com.nimbusds.jose.jwk.source.RemoteJWKSet
import com.nimbusds.jose.proc.SecurityContext
import com.nimbusds.jwt.SignedJWT
import me.arycer.leaguetracker.entity.User
import me.arycer.leaguetracker.repository.UserRepository
import org.springframework.stereotype.Service
import java.net.URL
import java.time.Instant
import java.util.*

@Service
class ClerkJwtService(
    private val userRepository: UserRepository
) {
    private val jwkSetUrl = URL("https://clerk.lt.arycer.me/.well-known/jwks.json")
    private val jwkSet = RemoteJWKSet<SecurityContext>(jwkSetUrl)

    fun validateToken(token: String): TokenInfo? {
        try {
            val signedJWT = SignedJWT.parse(token)
            val jwkMatches = jwkSet.get(JWKSelector(JWKMatcher.forJWSHeader(signedJWT.header)), null)
            val matchingKey = jwkMatches.firstOrNull() as? JWK ?: return null
            val publicKey = matchingKey.toRSAKey().toRSAPublicKey()
            val verifier = RSASSAVerifier(publicKey)
            if (!signedJWT.verify(verifier)) return null

            val claims = signedJWT.jwtClaimsSet
            val now = Date.from(Instant.now())
            if (claims.expirationTime == null || claims.expirationTime.before(now)) return null

            val userId = claims.subject ?: return null
            val usernameClaim = claims.getStringClaim("username")
            if (usernameClaim == null) return null

            if (!userRepository.existsById(userId) && !userRepository.existsUserByUsername(usernameClaim)) {
                createUserIfNotExists(usernameClaim, userId)
            }

            return TokenInfo(
                userId = userId,
                username = usernameClaim,
                expirationTime = claims.expirationTime
            )
        } catch (_: Exception) {
            return null
        }
    }

    @Synchronized
    private fun createUserIfNotExists(usernameClaim: String, userId: String) {
        val user = User(userId, usernameClaim)
        userRepository.save(user)
    }

    data class TokenInfo(
        val userId: String,
        val username: String,
        val expirationTime: Date
    )
}
