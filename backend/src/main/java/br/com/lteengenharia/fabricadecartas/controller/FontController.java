package br.com.lteengenharia.fabricadecartas.controller;

import br.com.lteengenharia.fabricadecartas.service.SystemFontService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
