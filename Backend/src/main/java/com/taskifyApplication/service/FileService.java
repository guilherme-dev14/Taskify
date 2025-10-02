package com.taskifyApplication.service;

import com.taskifyApplication.exception.BadRequestException;
import com.taskifyApplication.exception.InvalidFormatException;
import com.taskifyApplication.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;


@Service
public class FileService {

    @Autowired
    private Storage storage;

    @Value("${gcs.bucket.name}")
    private String bucketName;

    @Value("${app.upload.dir:${user.home}/taskify-uploads}")
    private String uploadDir;

    private final List<String> allowedFileTypes = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif",
            "application/pdf", "text/plain", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "-" + file.getOriginalFilename();

        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        return "https://storage.googleapis.com/" + bucketName + "/" + fileName;
    }

    public void deleteFile(String fileUrl) {
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        BlobId blobId = BlobId.of(bucketName, fileName);
        storage.delete(blobId);
    }

    public String saveAttachment(MultipartFile file) throws IOException {
        validateFile(file);
        
        String fileName = generateFileName(file.getOriginalFilename());
        String attachmentDir = uploadDir + "/attachments";
        
        createDirectoryIfNotExists(attachmentDir);
        
        Path filePath = Paths.get(attachmentDir, fileName);
        Files.write(filePath, file.getBytes());
        
        return fileName;
    }


    public byte[] getAttachment(String filename) throws IOException {
        Path filePath = Paths.get(uploadDir + "/attachments", filename);
        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("File not found");
        }
        return Files.readAllBytes(filePath);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidFormatException("File is empty");
        }
        
        if (!allowedFileTypes.contains(file.getContentType())) {
            throw new InvalidFormatException("Invalid file type");
        }
        
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit
            throw new InvalidFormatException("File size too large. Maximum 10MB allowed");
        }
    }

    private String generateFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    private void createDirectoryIfNotExists(String dir) throws IOException {
        File directory = new File(dir);
        if (!directory.exists()) {
            if (!directory.mkdirs()) {
                throw new BadRequestException("Failed to create directory: " + dir);
            }
        }
    }
}