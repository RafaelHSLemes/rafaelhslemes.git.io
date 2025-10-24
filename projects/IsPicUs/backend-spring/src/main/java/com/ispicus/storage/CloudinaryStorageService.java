package com.ispicus.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

public class CloudinaryStorageService implements StorageService {
  private final String url;

  public CloudinaryStorageService(@Value("${ispicus.upload.cloudinary.url}") String url) {
    this.url = url;
  }

  @Override
  public String upload(MultipartFile file) {
    // Implementar Cloudinary SDK (placeholder para manter exemplo leve)
    // Em produção: usar cloudinary-java para enviar e retornar URL pública.
    return "about:blank"; // placeholder
  }
}
