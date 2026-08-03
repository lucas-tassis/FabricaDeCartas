package br.com.lteengenharia.fabricadecartas.service;

import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PdfService {

    private final PdfLayoutService pdfLayoutService;
    private final ImageExportService imageExportService;

    public PdfService(PdfLayoutService pdfLayoutService, ImageExportService imageExportService) {
        this.pdfLayoutService = pdfLayoutService;
        this.imageExportService = imageExportService;
    }

    public byte[] generateCards(List<Map<String, String>> data, TemplateConfigDTO template, String format) throws Exception {
        if ("pdf".equalsIgnoreCase(format)) {
            return pdfLayoutService.generate(data, template);
        }
        return imageExportService.generate(data, template, format);
    }
}
