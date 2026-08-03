package br.com.lteengenharia.fabricadecartas.controller;

import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import br.com.lteengenharia.fabricadecartas.service.ExcelService;
import br.com.lteengenharia.fabricadecartas.service.PdfService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.io.PrintWriter;
import java.io.StringWriter;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
public class CardController {

    private static final Logger log = LoggerFactory.getLogger(CardController.class);

    private final ExcelService excelService;
    private final PdfService pdfService;
    private final ObjectMapper objectMapper;

    @Autowired
    public CardController(ExcelService excelService, PdfService pdfService, ObjectMapper objectMapper) {
        this.excelService = excelService;
        this.pdfService = pdfService;
        this.objectMapper = objectMapper;
    }

    private static byte[] stackTraceToBytes(Throwable t) {
        StringWriter sw = new StringWriter();
        t.printStackTrace(new PrintWriter(sw));
        return sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    @PostMapping("/extract-columns")
    public ResponseEntity<List<String>> extractColumns(@RequestParam("file") MultipartFile file) {
        try {
            List<String> columns = excelService.extractColumns(file);
            return ResponseEntity.ok(columns);
        } catch (Exception e) {
            log.error("Failed to extract columns from file: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateCards(
            @RequestParam("file") MultipartFile file,
            @RequestParam("template") String templateJson,
            @RequestParam(value = "format", defaultValue = "pdf") String format) {

        try {
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
        } catch (Throwable e) {
            log.error("Failed to generate cards: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(stackTraceToBytes(e));
        }
    }

    @PostMapping("/shutdown")
    public ResponseEntity<Void> shutdown() {
        log.info("Shutdown requested. Exiting application in 500ms...");
        new Thread(() -> {
            try {
                Thread.sleep(500);
            } catch (InterruptedException ignored) {}
            System.exit(0);
        }).start();
        return ResponseEntity.ok().build();
    }
}
