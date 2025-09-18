package com.taskifyApplication.controller;

import com.taskifyApplication.service.FileService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"})
@SecurityRequirement(name = "bearerAuth")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload/avatar")
    public ResponseEntity<String> uploadAvatar(@RequestParam("file") MultipartFile file) throws IOException {
            String fileName = fileService.saveAvatar(file);
            return ResponseEntity.ok(fileName);
    }

    @PostMapping("/upload/attachment")
    public ResponseEntity<String> uploadAttachment(@RequestParam("file") MultipartFile file) throws IOException {
            String fileName = fileService.saveAttachment(file);
            return ResponseEntity.ok(fileName);
    }

    @GetMapping("/avatar/{filename}")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String filename) throws IOException{
            byte[] file = fileService.getAvatar(filename);
            return ResponseEntity.ok()
                    .header("Content-Type", "image/jpeg")
                    .body(file);
    }

    @GetMapping("/attachment/{filename}")
    public ResponseEntity<byte[]> getAttachment(@PathVariable String filename) throws IOException {
            byte[] file = fileService.getAttachment(filename);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .body(file);
    }
}