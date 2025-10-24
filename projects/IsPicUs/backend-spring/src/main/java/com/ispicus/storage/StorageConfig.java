package com.ispicus.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

  @Value("${ispicus.upload.provider:cloudinary}")
  private String provider;

  @Bean
  public StorageService storageService(
      @Value("${ispicus.upload.cloudinary.url:}") String cloudUrl,
      @Value("${ispicus.upload.s3.bucket:}") String bucket,
      @Value("${ispicus.upload.s3.region:}") String region,
      @Value("${ispicus.upload.s3.accessKey:}") String accessKey,
      @Value("${ispicus.upload.s3.secretKey:}") String secretKey
  ) {
    if ("s3".equalsIgnoreCase(provider)) {
      return new S3StorageService(bucket, region, accessKey, secretKey);
    }
    return new CloudinaryStorageService(cloudUrl);
  }
}

