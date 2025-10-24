package com.ispicus.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
  String upload(MultipartFile file);
}

