package com.ispicus.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

public class S3StorageService implements StorageService {
  private final String bucket;
  private final String region;
  private final String accessKey;
  private final String secretKey;

  public S3StorageService(
      @Value("${ispicus.upload.s3.bucket}") String bucket,
      @Value("${ispicus.upload.s3.region}") String region,
      @Value("${ispicus.upload.s3.accessKey}") String accessKey,
      @Value("${ispicus.upload.s3.secretKey}") String secretKey
  ) {
    this.bucket = bucket;
    this.region = region;
    this.accessKey = accessKey;
    this.secretKey = secretKey;
  }

  @Override
  public String upload(MultipartFile file) {
    // Implementar AWS SDK (placeholder). Retornar URL pública após upload.
    return "about:blank"; // placeholder
  }
}
