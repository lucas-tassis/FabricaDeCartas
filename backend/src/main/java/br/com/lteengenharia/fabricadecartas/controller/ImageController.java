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
}
