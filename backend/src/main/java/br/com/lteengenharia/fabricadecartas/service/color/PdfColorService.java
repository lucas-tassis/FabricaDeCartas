package br.com.lteengenharia.fabricadecartas.service.color;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Color;

@Service
public class PdfColorService {

    private static final Logger log = LoggerFactory.getLogger(PdfColorService.class);

    public Color parseColor(String hexColor) {
        if (hexColor != null && !hexColor.isBlank()) {
            try {
                if (!hexColor.startsWith("#")) {
                    hexColor = "#" + hexColor;
                }
                return Color.decode(hexColor);
            } catch (Exception e) {
                log.warn("Invalid color '{}', defaulting to black", hexColor);
            }
        }
        return Color.BLACK;
    }

    public float[] rgbToCmyk(Color color) {
        float r = color.getRed() / 255f;
        float g = color.getGreen() / 255f;
        float b = color.getBlue() / 255f;
        float k = 1f - Math.max(r, Math.max(g, b));
        if (k >= 1f) return new float[]{0f, 0f, 0f, 1f};
        float denom = 1f - k;
        return new float[]{
            (1f - r - k) / denom,
            (1f - g - k) / denom,
            (1f - b - k) / denom,
            k
        };
    }
}
