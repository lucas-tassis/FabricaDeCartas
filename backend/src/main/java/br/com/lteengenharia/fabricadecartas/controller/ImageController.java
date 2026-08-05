package br.com.lteengenharia.fabricadecartas.controller;

import br.com.lteengenharia.fabricadecartas.service.ImageStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Handles image asset uploads for card generation.
 * Images are stored by filename; PdfService will match them by spreadsheet cell value.
 */
@RestController
@RequestMapping("/api/images")
public class ImageController {

    private static final Logger log = LoggerFactory.getLogger(ImageController.class);

    private final ImageStorageService imageStorageService;

    public ImageController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<List<String>> upload(@RequestParam("files") MultipartFile[] files) {
        log.info("Received {} image(s) for upload", files.length);
        List<String> stored = imageStorageService.storeImages(files);
        return ResponseEntity.ok(stored);
    }

    @GetMapping("/list")
    public ResponseEntity<List<String>> list() {
        return ResponseEntity.ok(imageStorageService.listImages());
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clear() {
        imageStorageService.clearAll();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/view/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> viewImage(@PathVariable("filename") String filename) {
        java.util.Optional<java.io.File> fileOpt = imageStorageService.resolveImage(filename);
        if (fileOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        java.io.File file = fileOpt.get();
        org.springframework.core.io.Resource resource = new org.springframework.core.io.FileSystemResource(file);
        String contentType = "image/jpeg";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) contentType = "image/png";
        else if (lower.endsWith(".svg")) contentType = "image/svg+xml";
        else if (lower.endsWith(".webp")) contentType = "image/webp";

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
