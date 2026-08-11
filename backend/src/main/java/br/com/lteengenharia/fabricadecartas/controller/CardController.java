package br.com.lteengenharia.fabricadecartas.controller;

import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import br.com.lteengenharia.fabricadecartas.service.ExcelService;
import br.com.lteengenharia.fabricadecartas.service.PdfService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private final ExcelService excelService;
    private final PdfService pdfService;
    private final ObjectMapper objectMapper;

    @Autowired
    public CardController(ExcelService excelService, PdfService pdfService, ObjectMapper objectMapper) {
        this.excelService = excelService;
        this.pdfService = pdfService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/extract-columns")
    public ResponseEntity<List<String>> extractColumns(@RequestParam("file") MultipartFile file) throws Exception {
        List<String> columns = excelService.extractColumns(file);
        return ResponseEntity.ok(columns);
    }

    @PostMapping("/preview-data")
    public ResponseEntity<Map<String, Object>> previewData(@RequestParam("file") MultipartFile file) throws Exception {
        List<String> columns = excelService.extractColumns(file);
        List<Map<String, String>> rows = excelService.extractData(file);
        Map<String, String> firstRow = rows.isEmpty() ? Collections.emptyMap() : rows.get(0);

        Map<String, Object> result = new HashMap<>();
        result.put("columns", columns);
        result.put("firstRow", firstRow);
        result.put("totalRows", rows.size());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateCards(
            @RequestParam("file") MultipartFile file,
            @RequestParam("template") String templateJson,
            @RequestParam(value = "format", defaultValue = "pdf") String format) throws Exception {

        TemplateConfigDTO template = objectMapper.readValue(templateJson, TemplateConfigDTO.class);
        List<Map<String, String>> data = excelService.extractData(file);
        byte[] fileBytes = pdfService.generateCards(data, template, format);

        HttpHeaders headers = new HttpHeaders();
        if ("pdf".equalsIgnoreCase(format)) {
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "cards.pdf");
        } else {
            headers.setContentType(MediaType.valueOf("application/zip"));
            headers.setContentDispositionFormData("attachment", "cards.zip");
        }

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }
}
