package br.com.lteengenharia.fabricadecartas.service;

import br.com.lteengenharia.fabricadecartas.dto.ColumnConfigDTO;
import br.com.lteengenharia.fabricadecartas.dto.ColumnType;
import br.com.lteengenharia.fabricadecartas.dto.ImageDrawBounds;
import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import br.com.lteengenharia.fabricadecartas.service.color.PdfColorService;
import br.com.lteengenharia.fabricadecartas.service.font.PdfFontSanitizer;
import br.com.lteengenharia.fabricadecartas.service.font.PdfTextLayoutEngine;
import br.com.lteengenharia.fabricadecartas.service.font.TextLayoutResult;
import br.com.lteengenharia.fabricadecartas.service.render.CardBackgroundRenderer;
import br.com.lteengenharia.fabricadecartas.service.util.ImageBoundsCalculator;
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
import java.io.FileInputStream;
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
    private final PdfTextLayoutEngine textLayoutEngine;
    private final ImageBoundsCalculator imageBoundsCalculator;

    public CardRenderService(SystemFontService systemFontService,
                             ImageStorageService imageStorageService,
                             ImageProcessingService imageProcessingService,
                             PdfColorService colorService,
                             PdfFontSanitizer fontSanitizer,
                             CardBackgroundRenderer backgroundRenderer,
                             PdfTextLayoutEngine textLayoutEngine,
                             ImageBoundsCalculator imageBoundsCalculator) {
        this.systemFontService = systemFontService;
        this.imageStorageService = imageStorageService;
        this.imageProcessingService = imageProcessingService;
        this.colorService = colorService;
        this.fontSanitizer = fontSanitizer;
        this.backgroundRenderer = backgroundRenderer;
        this.textLayoutEngine = textLayoutEngine;
        this.imageBoundsCalculator = imageBoundsCalculator;
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

                ImageDrawBounds bounds = imageBoundsCalculator.calculate(boxX, boxY, boxW, boxH, imgW, imgH, colConfig.getImageFit());

                contentStream.saveGraphicsState();
                double[][] squares = colConfig.getSquareRects();
                if (squares != null && squares.length > 0) {
                    for (double[] sq : squares) {
                        float sqX = (float) (startX + sq[0]);
                        float sqY = (float) (startY + template.getCardHeight() - sq[1] - sq[3]);
                        contentStream.addRect(sqX, sqY, (float) sq[2], (float) sq[3]);
                    }
                } else {
                    contentStream.addRect(boxX, boxY, boxW, boxH);
                }
                contentStream.clip();
                contentStream.drawImage(pdImage, bounds.drawX(), bounds.drawY(), bounds.drawW(), bounds.drawH());
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
            try (FileInputStream fis = new FileInputStream(fontFile.get())) {
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

        float boxWidth = (float) colConfig.getWidth();
        float boxHeight = (float) colConfig.getHeight();
        float minFontSize = 4.0f;

        double normRot = (colConfig.getRotation() % 360 + 360) % 360;
        boolean is90or270 = Math.abs(normRot - 90) < 5 || Math.abs(normRot - 270) < 5;
        float targetWidth = is90or270 ? boxHeight : boxWidth;
        float targetHeight = is90or270 ? boxWidth : boxHeight;

        TextLayoutResult layoutResult = textLayoutEngine.calculateLayout(
                text, font, fontSize, minFontSize, targetWidth, targetHeight
        );

        if (layoutResult.lines().isEmpty()) return;

        contentStream.saveGraphicsState();

        // 1. Clip text strictly within section bounds (in page coordinate space)
        double[][] squares = colConfig.getSquareRects();
        if (squares != null && squares.length > 0) {
            for (double[] sq : squares) {
                float sqX = (float) (startX + sq[0]);
                float sqY = (float) (startY + template.getCardHeight() - sq[1] - sq[3]);
                contentStream.addRect(sqX, sqY, (float) sq[2], (float) sq[3]);
            }
        } else {
            float boxX = (float) (startX + colConfig.getX());
            float boxY = (float) (startY + template.getCardHeight() - colConfig.getY() - boxHeight);
            contentStream.addRect(boxX, boxY, boxWidth, boxHeight);
        }
        contentStream.clip();

        // 2. Apply rotation transform if needed
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
            contentStream.transform(m);
        }

        contentStream.setNonStrokingColor(colorService.parseColor(colConfig.getColor()));

        float boxTopY = (float) (startY + template.getCardHeight() - colConfig.getY());
        String vAlign = colConfig.getVAlign() == null ? "" : colConfig.getVAlign().toLowerCase();
        float startYOffset = switch (vAlign) {
            case "center" -> boxTopY - (boxHeight - layoutResult.totalTextHeight()) / 2f - layoutResult.singleLineCapHeight();
            case "bottom" -> boxTopY - boxHeight + layoutResult.totalTextHeight() - layoutResult.singleLineCapHeight();
            default       -> boxTopY - layoutResult.singleLineCapHeight();
        };

        String hAlign = colConfig.getTextAlign() == null ? "" : colConfig.getTextAlign().toLowerCase();

        float currentLineY = startYOffset;
        for (String line : layoutResult.lines()) {
            float lineWidth = font.getStringWidth(line) / 1000f * layoutResult.fontSize();
            float lineX = (float) (startX + colConfig.getX());
            lineX += switch (hAlign) {
                case "center" -> (boxWidth - lineWidth) / 2f;
                case "right"  -> boxWidth - lineWidth;
                default       -> 0;
            };

            contentStream.beginText();
            contentStream.setFont(font, layoutResult.fontSize());
            contentStream.newLineAtOffset(lineX, currentLineY);
            contentStream.showText(line);
            contentStream.endText();

            currentLineY -= layoutResult.leading();
        }

        contentStream.restoreGraphicsState();
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
        contentStream.setNonStrokingColor(color);

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
