package com.ispicus.image;

import com.ispicus.storage.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
public class ImageController {
  private final ImageRepository images;
  private final StorageService storage;

  public ImageController(ImageRepository images, StorageService storage) {
    this.images = images;
    this.storage = storage;
  }

  @GetMapping("/public")
  public ResponseEntity<?> list(@RequestParam(required = false) String q,
                                @RequestParam(required = false) String tag,
                                @RequestParam(defaultValue = "50") int limit) {
    // Simplificação: filtros básicos em memória (ideal: query adequada no repo)
    var data = images.findAll();
    var stream = data.stream();
    if (q != null && !q.isBlank()) {
      var lq = q.toLowerCase();
      stream = stream.filter(it ->
          (it.title != null && it.title.toLowerCase().contains(lq)) ||
          (it.author != null && it.author.toLowerCase().contains(lq)) ||
          (it.tags != null && it.tags.stream().anyMatch(t -> t.toLowerCase().contains(lq)))
      );
    }
    if (tag != null && !tag.isBlank()) {
      stream = stream.filter(it -> it.tags != null && it.tags.contains(tag));
    }
    var items = stream.sorted((a,b) -> b.createdAt.compareTo(a.createdAt)).limit(limit).toList();
    return ResponseEntity.ok(Map.of("items", items));
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable String id) {
    return images.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok).orElse(ResponseEntity.status(404).body(Map.of("error","Não encontrado")));
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestParam("file") MultipartFile file,
                                  @RequestParam(required = false) String title,
                                  @RequestParam(required = false) List<String> tags,
                                  Authentication auth) {
    var userId = (String) auth.getPrincipal();
    var url = storage.upload(file);
    var img = new Image();
    img.ownerId = userId;
    img.title = (title == null || title.isBlank()) ? "Sem título" : title;
    img.url = url;
    img.thumbUrl = url;
    img.tags = tags;
    img.createdAt = Instant.now();
    images.save(img);
    return ResponseEntity.status(201).body(img);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> remove(@PathVariable String id, Authentication auth) {
    var userId = (String) auth.getPrincipal();
    var it = images.findById(id).orElse(null);
    if (it == null) return ResponseEntity.status(404).body(Map.of("error","Não encontrado"));
    if (!userId.equals(it.ownerId)) return ResponseEntity.status(403).body(Map.of("error","Proibido"));
    images.deleteById(id);
    return ResponseEntity.noContent().build();
  }
}

