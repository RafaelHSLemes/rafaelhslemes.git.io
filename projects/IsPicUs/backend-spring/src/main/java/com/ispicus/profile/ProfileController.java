package com.ispicus.profile;

import com.ispicus.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {
  private final ProfileRepository profiles;
  private final UserRepository users;

  public ProfileController(ProfileRepository profiles, UserRepository users) {
    this.profiles = profiles;
    this.users = users;
  }

  @GetMapping("/{username}")
  public ResponseEntity<?> byUsername(@PathVariable String username) {
    var user = users.findByUsername(username).orElse(null);
    if (user == null) return ResponseEntity.status(404).body(Map.of("error", "Usuário não encontrado"));
    var profile = profiles.findByUserId(user.id).orElse(null);
    return ResponseEntity.ok(Map.of("username", user.username, "profile", profile));
  }

  @PatchMapping("/me")
  public ResponseEntity<?> updateSelf(@RequestBody Profile body, Authentication auth) {
    var userId = (String) auth.getPrincipal();
    var existing = profiles.findByUserId(userId).orElseGet(() -> { var p = new Profile(); p.userId = userId; return p; });
    existing.displayName = body.displayName;
    existing.bio = body.bio;
    existing.avatarUrl = body.avatarUrl;
    existing.socials = body.socials;
    profiles.save(existing);
    return ResponseEntity.ok(existing);
  }
}

