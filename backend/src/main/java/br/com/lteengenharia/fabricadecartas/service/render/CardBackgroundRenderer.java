package br.com.lteengenharia.fabricadecartas.service.render;

import br.com.lteengenharia.fabricadecartas.dto.ImageDrawBounds;
import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import br.com.lteengenharia.fabricadecartas.service.ImageStorageService;
import br.com.lteengenharia.fabricadecartas.service.util.ImageBoundsCalculator;
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
    private final ImageBoundsCalculator imageBoundsCalculator;

    public CardBackgroundRenderer(ImageStorageService imageStorageService,
                                  ImageBoundsCalculator imageBoundsCalculator) {
        this.imageStorageService = imageStorageService;
        this.imageBoundsCalculator = imageBoundsCalculator;
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

                ImageDrawBounds bounds = imageBoundsCalculator.calculateFromString(
                        boxX, boxY, boxW, boxH, imgW, imgH, template.getCardBackgroundFit()
                );

                contentStream.drawImage(pdImage, bounds.drawX(), bounds.drawY(), bounds.drawW(), bounds.drawH());
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

                ImageDrawBounds bounds = imageBoundsCalculator.calculateFromString(
                        boxX, boxY, boxW, boxH, imgW, imgH, template.getCardBackFit()
                );

                contentStream.saveGraphicsState();
                contentStream.addRect(boxX, boxY, boxW, boxH);
                contentStream.clip();
                contentStream.drawImage(pdImage, bounds.drawX(), bounds.drawY(), bounds.drawW(), bounds.drawH());
                contentStream.restoreGraphicsState();
            } catch (Exception e) {
                log.warn("Failed to draw card back image '{}': {}", backImageName, e.getMessage());
            }
        });
    }
}
