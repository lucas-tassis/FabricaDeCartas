package br.com.lteengenharia.fabricadecartas.service.font;

import br.com.lteengenharia.fabricadecartas.config.AppConstants;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PdfTextLayoutEngine {

    public TextLayoutResult calculateLayout(String text, PDFont font, float initialFontSize,
                                            float minFontSize, float targetWidth, float targetHeight) throws Exception {
        if (text == null || text.isEmpty()) {
            return new TextLayoutResult(initialFontSize, Collections.emptyList(), 0, 0, initialFontSize * 1.2f, 0);
        }

        float fontSize = initialFontSize;
        List<String> lines = wrapText(text, font, fontSize, targetWidth);
        if (lines.isEmpty()) {
            return new TextLayoutResult(fontSize, Collections.emptyList(), 0, 0, fontSize * 1.2f, 0);
        }

        float leading = fontSize * 1.2f;
        float capHeight = (font.getFontDescriptor() != null)
                ? font.getFontDescriptor().getCapHeight()
                : 700f;
        float singleLineCapHeight = capHeight / (float) AppConstants.FONT_GLYPH_SCALE * fontSize;
        float totalTextHeight = (lines.size() - 1) * leading + singleLineCapHeight;
        float maxLineWidth = getMaxLineWidth(lines, font, fontSize);

        // Auto-scale font size down if text height exceeds targetHeight OR any line width exceeds targetWidth
        while ((totalTextHeight > targetHeight || maxLineWidth > targetWidth) && fontSize > minFontSize) {
            fontSize -= 0.5f;
            lines = wrapText(text, font, fontSize, targetWidth);
            leading = fontSize * 1.2f;
            singleLineCapHeight = capHeight / (float) AppConstants.FONT_GLYPH_SCALE * fontSize;
            totalTextHeight = (lines.size() - 1) * leading + singleLineCapHeight;
            maxLineWidth = getMaxLineWidth(lines, font, fontSize);
        }

        return new TextLayoutResult(fontSize, lines, totalTextHeight, maxLineWidth, leading, singleLineCapHeight);
    }

    public List<String> wrapText(String text, PDFont font, float fontSize, float maxWidth) throws Exception {
        List<String> result = new ArrayList<>();
        if (text == null || text.isBlank()) return result;

        String[] paragraphs = text.split("\r?\n");
        for (String paragraph : paragraphs) {
            if (paragraph.isBlank()) {
                result.add("");
                continue;
            }
            String[] words = paragraph.split(" ");
            StringBuilder currentLine = new StringBuilder();

            for (String word : words) {
                if (currentLine.length() == 0) {
                    currentLine.append(word);
                } else {
                    String testLine = currentLine.toString() + " " + word;
                    float width = font.getStringWidth(testLine) / (float) AppConstants.FONT_GLYPH_SCALE * fontSize;
                    if (width <= maxWidth) {
                        currentLine.append(" ").append(word);
                    } else {
                        result.add(currentLine.toString());
                        currentLine = new StringBuilder(word);
                    }
                }
            }
            if (currentLine.length() > 0) {
                result.add(currentLine.toString());
            }
        }
        return result;
    }

    public float getMaxLineWidth(List<String> lines, PDFont font, float fontSize) throws Exception {
        float maxW = 0f;
        for (String line : lines) {
            float w = font.getStringWidth(line) / (float) AppConstants.FONT_GLYPH_SCALE * fontSize;
            if (w > maxW) maxW = w;
        }
        return maxW;
    }
}
