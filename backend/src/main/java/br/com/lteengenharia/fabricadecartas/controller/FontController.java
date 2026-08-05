package br.com.lteengenharia.fabricadecartas.controller;

import br.com.lteengenharia.fabricadecartas.service.SystemFontService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api/fonts")
public class FontController {

    private final SystemFontService systemFontService;

    public FontController(SystemFontService systemFontService) {
        this.systemFontService = systemFontService;
    }

    @GetMapping
    public List<String> listFonts() {
        return systemFontService.listFamilies();
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFont(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Arquivo de fonte vazio");
        }
        String originalName = file.getOriginalFilename();
        if (originalName == null || (!originalName.toLowerCase().endsWith(".ttf") && !originalName.toLowerCase().endsWith(".otf"))) {
            return ResponseEntity.badRequest().body("Apenas arquivos .ttf ou .otf são permitidos");
        }

        try {
            File fontDir = systemFontService.getCustomFontsDir().getAbsoluteFile();
            if (!fontDir.exists()) {
                fontDir.mkdirs();
            }
            File dest = new File(fontDir, originalName);
            java.nio.file.Files.copy(file.getInputStream(), dest.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            systemFontService.refresh();
            return ResponseEntity.ok("Fonte enviada com sucesso: " + originalName);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao salvar fonte: " + e.getClass().getName() + " - " + e.getMessage());
        }
    }
}
