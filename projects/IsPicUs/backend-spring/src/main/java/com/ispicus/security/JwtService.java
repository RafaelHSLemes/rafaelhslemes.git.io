package com.ispicus.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Duration;
import java.util.Date;

@Component
public class JwtService {
  private final Key key;
  private final Duration expires;
  private final Duration refreshExpires;

  public JwtService(
      @Value("${ispicus.jwt.secret}") String secret,
      @Value("${ispicus.jwt.expires}") Duration expires,
      @Value("${ispicus.jwt.refreshExpires}") Duration refreshExpires
  ) {
    this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(java.util.Base64.getEncoder().encodeToString(secret.getBytes())));
    this.expires = expires;
    this.refreshExpires = refreshExpires;
  }

  public String sign(String subject) {
    return Jwts.builder()
        .subject(subject)
        .expiration(new Date(System.currentTimeMillis() + expires.toMillis()))
        .signWith(key)
        .compact();
  }

  public String signRefresh(String subject) {
    return Jwts.builder()
        .subject(subject)
        .expiration(new Date(System.currentTimeMillis() + refreshExpires.toMillis()))
        .signWith(key)
        .compact();
  }

  public String parseSubject(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
  }
}

