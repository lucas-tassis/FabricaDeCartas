package br.com.lteengenharia.fabricadecartas.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Manages temporary image storage for card generation.
 * Images are stored by their original filename so PdfService can look them up
 * by matching the spreadsheet cell value to the image filename.
 */
@Service
public class ImageStorageService {

    private static final Logger log = LoggerFactory.getLogger(ImageStorageService.class);
    private static final Path STORAGE_DIR = Paths.get(System.getProperty("java.io.tmpdir"), "fabricadecartas-images");

    public ImageStorageService() {
        try {
            Files.createDirectories(STORAGE_DIR);
            clearAll();
            log.info("Image storage ready (cleared on startup): {}", STORAGE_DIR.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to initialize image storage directory", e);
        }
    }

    public List<String> storeImages(MultipartFile[] files) {
        List<String> stored = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) continue;
            storeImage(file).ifPresent(stored::add);
        }
        Collections.sort(stored);
        return stored;
    }

    private Optional<String> storeImage(MultipartFile file) {
        try {
            String filename = file.getOriginalFilename();
            if (filename == null || filename.isBlank()) return Optional.empty();
            Path dest = STORAGE_DIR.resolve(filename);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
            }
            log.info("Stored image: {} ({} bytes)", filename, Files.size(dest));
            return Optional.of(filename);
        } catch (IOException e) {
            log.error("Failed to store image '{}': {}", file.getOriginalFilename(), e.getMessage(), e);
            return Optional.empty();
        }
    }

    public Optional<File> resolveImage(String name) {
        if (name == null || name.isBlank()) return Optional.empty();

        File exact = STORAGE_DIR.resolve(name).toFile();
        if (exact.exists()) return Optional.of(exact);

        for (String ext : List.of(".png", ".PNG", ".jpg", ".JPG", ".jpeg", ".JPEG", ".webp", ".WEBP", ".gif", ".GIF", ".svg", ".SVG")) {
            File candidate = STORAGE_DIR.resolve(name + ext).toFile();
            if (candidate.exists()) return Optional.of(candidate);
        }

        File[] storedFiles = STORAGE_DIR.toFile().listFiles();
        if (storedFiles != null) {
            String cleanName = name.trim().toLowerCase();
            for (File f : storedFiles) {
                if (f.isFile() && f.getName().equalsIgnoreCase(name.trim())) {
                    return Optional.of(f);
                }
            }
            for (File f : storedFiles) {
                if (f.isFile()) {
                    String fname = f.getName();
                    int dot = fname.lastIndexOf('.');
                    String stem = (dot > 0) ? fname.substring(0, dot) : fname;
                    if (stem.equalsIgnoreCase(cleanName)) {
                        return Optional.of(f);
                    }
                }
            }
            for (File f : storedFiles) {
                if (f.isFile()) {
                    String fname = f.getName().toLowerCase();
                    int dot = fname.lastIndexOf('.');
                    String stem = (dot > 0) ? fname.substring(0, dot) : fname;
                    if (fname.contains(cleanName) || cleanName.contains(stem)) {
                        return Optional.of(f);
                    }
                }
            }
        }

        log.warn("Image not found in storage for name: {}", name);
        return Optional.empty();
    }

    public List<String> listImages() {
        File[] files = STORAGE_DIR.toFile().listFiles();
        if (files == null) return Collections.emptyList();
        return Arrays.stream(files)
                .filter(File::isFile)
                .map(File::getName)
                .sorted()
                .collect(Collectors.toList());
    }

    public void clearAll() {
        File[] files = STORAGE_DIR.toFile().listFiles();
        if (files == null) return;
        for (File f : files) {
            if (!f.delete()) log.warn("Could not delete image: {}", f.getName());
        }
    }
}
