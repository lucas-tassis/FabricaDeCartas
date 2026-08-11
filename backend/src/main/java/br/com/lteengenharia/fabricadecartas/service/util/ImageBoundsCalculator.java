package br.com.lteengenharia.fabricadecartas.service.util;

import br.com.lteengenharia.fabricadecartas.dto.ImageDrawBounds;
import br.com.lteengenharia.fabricadecartas.dto.ImageFit;
import org.springframework.stereotype.Component;

@Component
public class ImageBoundsCalculator {

    public ImageDrawBounds calculate(float boxX, float boxY, float boxW, float boxH,
                                     float imgW, float imgH, ImageFit fit) {
        if (fit == null) {
            fit = ImageFit.COVER;
        }

        float drawX = boxX;
        float drawY = boxY;
        float drawW = boxW;
        float drawH = boxH;

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

        return new ImageDrawBounds(drawX, drawY, drawW, drawH);
    }

    public ImageDrawBounds calculateFromString(float boxX, float boxY, float boxW, float boxH,
                                               float imgW, float imgH, String fitStr) {
        ImageFit fit = ImageFit.COVER;
        if (fitStr != null && !fitStr.isBlank()) {
            try {
                fit = ImageFit.valueOf(fitStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                fit = ImageFit.COVER;
            }
        }
        return calculate(boxX, boxY, boxW, boxH, imgW, imgH, fit);
    }
}
