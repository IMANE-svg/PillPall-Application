package com.pillpall.med_application.security;

import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service;
import java.security.Key; import java.time.Instant; import java.util.Date; import java.util.Map;

@Service
public class JwtService {
    private final Key key;
    private final long expirationSeconds;

    public JwtService(@Value("${app.security.jwt.secret}") String secret,
                      @Value("${app.security.jwt.expirationSeconds}") long exp) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationSeconds = exp;
    }

    public String generate(String subject, Map<String,Object> claims) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(subject)
                .addClaims(claims)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
    }
}
