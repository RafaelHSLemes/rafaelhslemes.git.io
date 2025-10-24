package com.ispicus.image;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document("images")
public class Image {
  @Id
  public String id;
  @Indexed
  public String ownerId;
  public String title;
  public String url;
  public String thumbUrl;
  public String author;
  public List<String> tags;
  public Instant createdAt = Instant.now();
}

