package com.ispicus.auth;

import com.ispicus.profile.Profile;
import com.ispicus.profile.ProfileRepository;
import com.ispicus.security.JwtService;
import com.ispicus.user.User;
import com.ispicus.user.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Validated
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users;
  private final ProfileRepository profiles;
  private final JwtService jwt;
  private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

  public AuthController(UserRepository users, ProfileRepository profiles, JwtService jwt) {
    this.users = users;
    this.profiles = profiles;
    this.jwt = jwt;
  }

  public record RegisterReq(@NotBlank String username, @Email String email, @NotBlank String password) {}

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody RegisterReq req) {
    if (users.existsByUsernameOrEmail(req.username(), req.email())) {
      return ResponseEntity.status(409).body(Map.of("error", "Usuário já existe"));
    }
    User u = new User();
    u.username = req.username();
    u.email = req.email();
    u.passwordHash = encoder.encode(req.password());
    users.save(u);
    Profile p = new Profile();
    p.userId = u.id;
    p.displayName = u.username;
    profiles.save(p);
    return ResponseEntity.status(201).body(Map.of("id", u.id, "username", u.username, "email", u.email));
  }

  public record LoginReq(@NotBlank String username, @NotBlank String password) {}

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginReq req) {
    var u = users.findByUsername(req.username()).orElse(null);
    if (u == null || !encoder.matches(req.password(), u.passwordHash)) {
      return ResponseEntity.status(401).body(Map.of("error", "Credenciais inválidas"));
    }
    return ResponseEntity.ok(Map.of(
        "accessToken", jwt.sign(u.id),
        "refreshToken", jwt.signRefresh(u.id)
    ));
  }
}

