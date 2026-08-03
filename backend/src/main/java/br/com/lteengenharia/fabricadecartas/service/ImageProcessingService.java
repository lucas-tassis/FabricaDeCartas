package br.com.lteengenharia.fabricadecartas.service;

import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.awt.image.RescaleOp;
import java.io.File;
import java.io.IOException;

@Service
public class ImageProcessingService {

    public BufferedImage applyFilters(File imgFile, Integer brightness, Integer contrast) throws IOException {
        BufferedImage srcImage = ImageIO.read(imgFile);
        if (srcImage == null) {
            throw new IOException("Failed to read image file: " + imgFile.getName());
        }

        boolean hasBrightness = brightness != null && brightness != 100;
        boolean hasContrast = contrast != null && contrast != 100;

        if (!hasBrightness && !hasContrast) {
            return srcImage;
        }

        int type = srcImage.getColorModel().hasAlpha() ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB;
        BufferedImage converted = new BufferedImage(srcImage.getWidth(), srcImage.getHeight(), type);
        Graphics2D g = converted.createGraphics();
        g.drawImage(srcImage, 0, 0, null);
        g.dispose();

        float contrastFactor = (contrast != null ? contrast : 100) / 100.0f;
        float brightnessOffset = ((brightness != null ? brightness : 100) - 100.0f) * 2.55f;
        float offset = 128.0f * (1.0f - contrastFactor) + brightnessOffset;

        BufferedImage filteredImage;
        if (type == BufferedImage.TYPE_INT_ARGB) {
            float[] scaleFactors = {contrastFactor, contrastFactor, contrastFactor, 1.0f};
            float[] offsets = {offset, offset, offset, 0.0f};
            RescaleOp op = new RescaleOp(scaleFactors, offsets, null);
            filteredImage = op.filter(converted, null);
        } else {
            RescaleOp op = new RescaleOp(contrastFactor, offset, null);
            filteredImage = op.filter(converted, null);
        }

        return filteredImage;
    }
}
