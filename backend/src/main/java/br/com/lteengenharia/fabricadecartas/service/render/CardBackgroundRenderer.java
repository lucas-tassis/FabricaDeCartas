package br.com.lteengenharia.fabricadecartas.service.render;

import br.com.lteengenharia.fabricadecartas.config.AppConstants;
import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import br.com.lteengenharia.fabricadecartas.service.ImageStorageService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class CardBackgroundRenderer {

    private static final Logger log = LoggerFactory.getLogger(CardBackgroundRenderer.class);

    private final ImageStorageService imageStorageService;

    public CardBackgroundRenderer(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    public void drawCardBackground(PDDocument document, PDPageContentStream contentStream,
                                   TemplateConfigDTO template, double startX, double startY) {
        String bgName = template.getCardBackgroundImage();
        if (bgName == null || bgName.isBlank()) return;

        imageStorageService.resolveImage(bgName).ifPresent(imgFile -> {
            try {
                PDImageXObject pdImage = PDImageXObject.createFromFile(imgFile.getAbsolutePath(), document);
                float boxX = (float) startX;
                float boxY = (float) startY;
                float boxW = (float) template.getCardWidth();
                float boxH = (float) template.getCardHeight();
                float imgW = pdImage.getWidth();
                float imgH = pdImage.getHeight();

                float drawX = boxX, drawY = boxY, drawW = boxW, drawH = boxH;
                String fit = template.getCardBackgroundFit();
                if (fit == null) fit = "cover";

                switch (fit.toLowerCase()) {
                    case "contain" -> {
                        float scale = Math.min(boxW / imgW, boxH / imgH);
                        drawW = imgW * scale;
                        drawH = imgH * scale;
                        drawX = boxX + (boxW - drawW) / 2f;
                        drawY = boxY + (boxH - drawH) / 2f;
                    }
                    case "cover" -> {
                        float scale = Math.max(boxW / imgW, boxH / imgH);
                        drawW = imgW * scale;
                        drawH = imgH * scale;
                        drawX = boxX + (boxW - drawW) / 2f;
                        drawY = boxY + (boxH - drawH) / 2f;
                    }
                    case "fill" -> { /* drawW = boxW, drawH = boxH */ }
                }

                contentStream.drawImage(pdImage, drawX, drawY, drawW, drawH);
            } catch (Exception e) {
                log.warn("Failed to draw card background image '{}': {}", bgName, e.getMessage());
            }
        });
    }

    public void drawCardBack(PDDocument document, PDPageContentStream contentStream,
                             TemplateConfigDTO template, String backImageName,
                             double startX, double startY) {
        if (backImageName == null || backImageName.isBlank()) return;

        imageStorageService.resolveImage(backImageName).ifPresent(imgFile -> {
            try {
                PDImageXObject pdImage = PDImageXObject.createFromFile(imgFile.getAbsolutePath(), document);
                float boxX = (float) startX;
                float boxY = (float) startY;
                float boxW = (float) template.getCardWidth();
                float boxH = (float) template.getCardHeight();

                float imgW = pdImage.getWidth();
                float imgH = pdImage.getHeight();

                float drawX = boxX, drawY = boxY, drawW = boxW, drawH = boxH;
                String fit = template.getCardBackFit() == null ? "cover" : template.getCardBackFit().toLowerCase();

                switch (fit) {
                    case "contain" -> {
                        float scale = Math.min(boxW / imgW, boxH / imgH);
                        drawW = imgW * scale;
                        drawH = imgH * scale;
                        drawX = boxX + (boxW - drawW) / 2f;
                        drawY = boxY + (boxH - drawH) / 2f;
                    }
                    case "cover" -> {
                        float scale = Math.max(boxW / imgW, boxH / imgH);
                        drawW = imgW * scale;
                        drawH = imgH * scale;
                        drawX = boxX + (boxW - drawW) / 2f;
                        drawY = boxY + (boxH - drawH) / 2f;
                    }
                    case "smart" -> {
                        float containScale = Math.min(boxW / imgW, boxH / imgH);
                        float scale = containScale > 1f
                                ? Math.max(boxW / imgW, boxH / imgH)
                                : containScale;
                        drawW = imgW * scale;
                        drawH = imgH * scale;
                        drawX = boxX + (boxW - drawW) / 2f;
                        drawY = boxY + (boxH - drawH) / 2f;
                    }
                    case "fill" -> { /* already set */ }
                    case "none" -> {
                        drawW = imgW;
                        drawH = imgH;
                        drawX = boxX + (boxW - drawW) / 2f;
                        drawY = boxY + (boxH - drawH) / 2f;
                    }
                }

                contentStream.saveGraphicsState();
                contentStream.addRect(boxX, boxY, boxW, boxH);
                contentStream.clip();
                contentStream.drawImage(pdImage, drawX, drawY, drawW, drawH);
                contentStream.restoreGraphicsState();
            } catch (Exception e) {
                log.warn("Failed to draw card back image '{}': {}", backImageName, e.getMessage());
            }
        });
    }
}
