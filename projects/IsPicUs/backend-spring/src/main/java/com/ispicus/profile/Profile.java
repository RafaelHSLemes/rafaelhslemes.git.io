package com.ispicus.profile;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("profiles")
public class Profile {
  @Id
  public String id;
  @Indexed(unique = true)
  public String userId;
  public String displayName;
  public String bio;
  public String avatarUrl;
  public Socials socials;

  public static class Socials {
    public String instagram;
    public String twitter;
    public String website;
  }
}

