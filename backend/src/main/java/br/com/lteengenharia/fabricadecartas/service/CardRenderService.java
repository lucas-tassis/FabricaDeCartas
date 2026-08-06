package br.com.lteengenharia.fabricadecartas.service;

import br.com.lteengenharia.fabricadecartas.config.AppConstants;
import br.com.lteengenharia.fabricadecartas.dto.ColumnConfigDTO;
import br.com.lteengenharia.fabricadecartas.dto.ColumnType;
import br.com.lteengenharia.fabricadecartas.dto.ImageFit;
import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import br.com.lteengenharia.fabricadecartas.service.color.PdfColorService;
import br.com.lteengenharia.fabricadecartas.service.font.PdfFontSanitizer;
import br.com.lteengenharia.fabricadecartas.service.render.CardBackgroundRenderer;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.util.Matrix;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CardRenderService {

    private static final Logger log = LoggerFactory.getLogger(CardRenderService.class);

    private final SystemFontService systemFontService;
    private final ImageStorageService imageStorageService;
    private final ImageProcessingService imageProcessingService;
    private final PdfColorService colorService;
    private final PdfFontSanitizer fontSanitizer;
    private final CardBackgroundRenderer backgroundRenderer;

    public CardRenderService(SystemFontService systemFontService,
                             ImageStorageService imageStorageService,
                             ImageProcessingService imageProcessingService,
                             PdfColorService colorService,
                             PdfFontSanitizer fontSanitizer,
                             CardBackgroundRenderer backgroundRenderer) {
        this.systemFontService = systemFontService;
        this.imageStorageService = imageStorageService;
        this.imageProcessingService = imageProcessingService;
        this.colorService = colorService;
        this.fontSanitizer = fontSanitizer;
        this.backgroundRenderer = backgroundRenderer;
    }

    public void drawCard(PDDocument document, PDPageContentStream contentStream,
                         Map<String, String> cardData, TemplateConfigDTO template,
                         double startX, double startY) throws Exception {
        drawCardFront(document, contentStream, template, cardData, startX, startY);
    }

    public void drawCardFront(PDDocument document, PDPageContentStream contentStream,
                              TemplateConfigDTO template, Map<String, String> cardData,
                              double startX, double startY) throws Exception {

        contentStream.saveGraphicsState();
        contentStream.addRect((float) startX, (float) startY,
                (float) template.getCardWidth(), (float) template.getCardHeight());
        contentStream.clip();

        backgroundRenderer.drawCardBackground(document, contentStream, template, startX, startY);

        for (ColumnConfigDTO colConfig : template.getColumns()) {
            String colName = colConfig.getColumnName();
            String cellValue = (colName == null || colName.isBlank())
                    ? ""
                    : cardData.getOrDefault(colName, "");
            boolean hasContent = cellValue != null && !cellValue.trim().isEmpty();

            if (colConfig.getType() == ColumnType.BORDAS) {
                if (hasContent) drawColorFill(contentStream, colConfig, template, cellValue, startX, startY);
                continue;
            }

            drawBackgroundFill(contentStream, colConfig, template, startX, startY);
            drawBorderIfNeeded(contentStream, colConfig, template, startX, startY);

            if (!hasContent) continue;

            if (colConfig.getType() == ColumnType.IMAGE) {
                drawImageColumn(document, contentStream, colConfig, template, cellValue, startX, startY);
            } else {
                drawTextColumn(document, contentStream, colConfig, template, cellValue, startX, startY);
            }
        }

        contentStream.restoreGraphicsState();
        double borderThickness = template.getCardBorderThickness();
        if (borderThickness > 0) {
            Color borderColor = colorService.parseColor(template.getCardBorderColor());
            contentStream.setLineWidth((float) borderThickness);
            contentStream.setStrokingColor(borderColor);
            contentStream.addRect((float) startX, (float) startY,
                    (float) template.getCardWidth(), (float) template.getCardHeight());
            contentStream.stroke();
            contentStream.setLineWidth(1f);
        }
    }

    private void drawColorFill(PDPageContentStream contentStream, ColumnConfigDTO colConfig,
                                TemplateConfigDTO template, String hexValue,
                                double startX, double startY) throws Exception {
        String hex = hexValue.trim().startsWith("#") ? hexValue.trim() : "#" + hexValue.trim();
        Color rgbColor = colorService.parseColor(hex);
        contentStream.setNonStrokingColor(rgbColor);

        double[][] squares = colConfig.getSquareRects();
        if (squares != null && squares.length > 0) {
            for (double[] sq : squares) {
                float sqX = (float) (startX + sq[0]);
                float sqY = (float) (startY + template.getCardHeight() - sq[1] - sq[3]);
                contentStream.addRect(sqX, sqY, (float) sq[2], (float) sq[3]);
            }
        } else {
            float boxX = (float) (startX + colConfig.getX());
            float boxY = (float) (startY + template.getCardHeight() - colConfig.getY() - colConfig.getHeight());
            contentStream.addRect(boxX, boxY, (float) colConfig.getWidth(), (float) colConfig.getHeight());
        }
        contentStream.fill();
    }

    private void drawBorderIfNeeded(PDPageContentStream contentStream, ColumnConfigDTO colConfig,
                                    TemplateConfigDTO template, double startX, double startY) throws Exception {
        if (colConfig.getBorderThickness() <= 0) return;
        Color color = colorService.parseColor(colConfig.getColor());
        contentStream.setLineWidth((float) colConfig.getBorderThickness());
        contentStream.setStrokingColor(color);
        float boxX = (float) (startX + colConfig.getX());
        float boxY = (float) (startY + template.getCardHeight() - colConfig.getY() - colConfig.getHeight());
        contentStream.addRect(boxX, boxY, (float) colConfig.getWidth(), (float) colConfig.getHeight());
        contentStream.stroke();
        contentStream.setLineWidth(1f);
    }

    private void drawImageColumn(PDDocument document, PDPageContentStream contentStream,
                                  ColumnConfigDTO colConfig, TemplateConfigDTO template,
                                  String imageName, double startX, double startY) {
        imageStorageService.resolveImage(imageName).ifPresent(imgFile -> {
            try {
                boolean hasFilters = (colConfig.getBrightness() != null && colConfig.getBrightness() != 100)
                        || (colConfig.getContrast() != null && colConfig.getContrast() != 100);

                PDImageXObject pdImage;
                if (hasFilters) {
                    java.awt.image.BufferedImage filtered = imageProcessingService.applyFilters(
                            imgFile, colConfig.getBrightness(), colConfig.getContrast()
                    );
                    pdImage = org.apache.pdfbox.pdmodel.graphics.image.LosslessFactory.createFromImage(document, filtered);
                } else {
                    pdImage = PDImageXObject.createFromFile(imgFile.getAbsolutePath(), document);
                }
                float boxX = (float) (startX + colConfig.getX());
                float boxY = (float) (startY + template.getCardHeight() - colConfig.getY() - colConfig.getHeight());
                float boxW = (float) colConfig.getWidth();
                float boxH = (float) colConfig.getHeight();
                float imgW = pdImage.getWidth();
                float imgH = pdImage.getHeight();

                float drawX = boxX, drawY = boxY, drawW = boxW, drawH = boxH;
                ImageFit fit = colConfig.getImageFit();

                switch (fit) {
                    case CONTAIN -> {
                        float scale = Math.min(boxW / imgW, boxH / imgH);
                        drawW = imgW * scale;
                        drawH = imgH * scale;
                        drawX = boxX + (boxW - drawW) / 2f;
                        drawY = boxY + (boxH - drawH) / 2f;
                    }
                    case COVER -> {
                        float scale = Math.max(boxW / imgW, boxH / imgH);
                        drawW = imgW * scale;
                        drawH = imgH * scale;
                        drawX = boxX + (boxW - drawW) / 2f;
                        drawY = boxY + (boxH - drawH) / 2f;
                    }
                    case SMART -> {
                        float containScale = Math.min(boxW / imgW, boxH / imgH);
                        float scale = containScale > 1f
                                ? Math.max(boxW / imgW, boxH / imgH)
                                : containScale;
                        drawW = imgW * scale;
                        drawH = imgH * scale;
                        drawX = boxX + (boxW - drawW) / 2f;
                        drawY = boxY + (boxH - drawH) / 2f;
                    }
                    case FILL -> { }
                    case NONE -> {
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
                log.warn("Failed to draw image '{}': {}", imgFile.getName(), e.getMessage());
            }
        });
    }

    private void drawTextColumn(PDDocument document, PDPageContentStream contentStream,
                                ColumnConfigDTO colConfig, TemplateConfigDTO template,
                                String text, double startX, double startY) throws Exception {
        if (colConfig.getColor() == null || colConfig.getColor().isBlank()) return;

        float fontSize = (float) colConfig.getFontSize();

        PDFont font;
        Optional<File> fontFile = systemFontService.resolveFile(colConfig.getFontFamily(), colConfig.isBold());
        if (fontFile.isPresent()) {
            try (java.io.FileInputStream fis = new java.io.FileInputStream(fontFile.get())) {
                font = PDType0Font.load(document, fis, false);
            } catch (Exception e) {
                log.warn("Failed to load system font '{}', falling back to Standard14: {}",
                        colConfig.getFontFamily(), e.getMessage());
                font = new PDType1Font(resolveFont(colConfig.getFontFamily(), colConfig.isBold()));
            }
        } else {
            font = new PDType1Font(resolveFont(colConfig.getFontFamily(), colConfig.isBold()));
        }

        text = fontSanitizer.sanitizeTextForFont(font, text);
        if (text.isEmpty()) return;

        float textWidth = font.getStringWidth(text) / (float) AppConstants.FONT_GLYPH_SCALE * fontSize;
        float capHeight = (font.getFontDescriptor() != null)
                ? font.getFontDescriptor().getCapHeight()
                : 700f;
        float textHeight = capHeight / (float) AppConstants.FONT_GLYPH_SCALE * fontSize;
        float boxWidth = (float) colConfig.getWidth();
        float boxHeight = (float) colConfig.getHeight();

        float textX = (float) (startX + colConfig.getX());
        String hAlign = colConfig.getTextAlign() == null ? "" : colConfig.getTextAlign().toLowerCase();
        textX += switch (hAlign) {
            case "center" -> (boxWidth - textWidth) / 2;
            case "right"  -> boxWidth - textWidth;
            default       -> 0;
        };

        float boxTopY = (float) (startY + template.getCardHeight() - colConfig.getY());
        String vAlign = colConfig.getVAlign() == null ? "" : colConfig.getVAlign().toLowerCase();
        float textY = switch (vAlign) {
            case "center" -> boxTopY - (boxHeight - textHeight) / 2 - textHeight;
            case "bottom" -> boxTopY - boxHeight;
            default       -> boxTopY - textHeight;
        };

        boolean doRotate = Math.abs(colConfig.getRotation()) > 0.01;
        if (doRotate) {
            float cx = (float) (startX + colConfig.getX() + boxWidth / 2);
            float cy = (float) (startY + template.getCardHeight() - colConfig.getY() - boxHeight / 2);
            double theta = Math.toRadians(-colConfig.getRotation());
            float cosT = (float) Math.cos(theta);
            float sinT = (float) Math.sin(theta);
            Matrix m = new Matrix(cosT, sinT, -sinT, cosT,
                    cx - cx * cosT + cy * sinT,
                    cy - cx * sinT - cy * cosT);
            contentStream.saveGraphicsState();
            contentStream.transform(m);
        }

        contentStream.setNonStrokingColor(colorService.parseColor(colConfig.getColor()));
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(textX, textY);
        contentStream.showText(text);
        contentStream.endText();

        if (doRotate) {
            contentStream.restoreGraphicsState();
        }
    }

    public void drawCardBack(PDDocument document, PDPageContentStream contentStream,
                             TemplateConfigDTO template, String backImageName,
                             double startX, double startY) throws Exception {
        backgroundRenderer.drawCardBack(document, contentStream, template, backImageName, startX, startY);
    }

    private void drawBackgroundFill(PDPageContentStream contentStream, ColumnConfigDTO colConfig,
                                    TemplateConfigDTO template, double startX, double startY) throws Exception {
        String bg = colConfig.getBackgroundColor();
        if (bg == null || bg.isBlank()) return;
        Color color = colorService.parseColor(bg);
        float boxX = (float) (startX + colConfig.getX());
        float boxY = (float) (startY + template.getCardHeight() - colConfig.getY() - colConfig.getHeight());
        contentStream.setNonStrokingColor(color);
        contentStream.addRect(boxX, boxY, (float) colConfig.getWidth(), (float) colConfig.getHeight());
        contentStream.fill();
    }

    private Standard14Fonts.FontName resolveFont(String family, boolean isBold) {
        if (family == null) return isBold ? Standard14Fonts.FontName.HELVETICA_BOLD : Standard14Fonts.FontName.HELVETICA;
        return switch (family.toLowerCase()) {
            case "times", "times-roman", "serif" ->
                    isBold ? Standard14Fonts.FontName.TIMES_BOLD : Standard14Fonts.FontName.TIMES_ROMAN;
            case "courier", "monospace" ->
                    isBold ? Standard14Fonts.FontName.COURIER_BOLD : Standard14Fonts.FontName.COURIER;
            default ->
                    isBold ? Standard14Fonts.FontName.HELVETICA_BOLD : Standard14Fonts.FontName.HELVETICA;
        };
    }
}
