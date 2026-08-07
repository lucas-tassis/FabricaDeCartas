package br.com.lteengenharia.fabricadecartas.service;

import br.com.lteengenharia.fabricadecartas.config.AppConstants;
import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ImageExportService {

    private final CardRenderService cardRenderService;
    private final ZipExportService zipExportService;

    public ImageExportService(CardRenderService cardRenderService, ZipExportService zipExportService) {
        this.cardRenderService = cardRenderService;
        this.zipExportService = zipExportService;
    }

    public byte[] generate(List<Map<String, String>> data, TemplateConfigDTO template, String format) throws Exception {
        PDRectangle cardRect = new PDRectangle(
                (float) (template.getCardWidth() * AppConstants.MM_TO_POINTS),
                (float) (template.getCardHeight() * AppConstants.MM_TO_POINTS)
        );
        String imgFormat = "jpg".equalsIgnoreCase(format) ? "JPEG" : "PNG";
        String extension = format.toLowerCase();

        boolean hasBack = !"none".equalsIgnoreCase(template.getCardBackType());

        Map<String, byte[]> zipContents = new LinkedHashMap<>();

        for (int i = 0; i < data.size(); i++) {
            Map<String, String> row = data.get(i);
            int cardNum = i + 1;

            // 1. Render front
            try (PDDocument cardDoc = new PDDocument()) {
                PDPage page = new PDPage(cardRect);
                cardDoc.addPage(page);
                try (PDPageContentStream cs = new PDPageContentStream(cardDoc, page)) {
                    cardRenderService.drawCard(cardDoc, cs, row, template, 0, 0);
                }
                BufferedImage image = renderCard(cardDoc);
                ByteArrayOutputStream imageBaos = new ByteArrayOutputStream();
                ImageIO.write(image, imgFormat, imageBaos);

                String name = hasBack ? "carta_" + cardNum + "_frente." + extension : "carta_" + cardNum + "." + extension;
                zipContents.put(name, imageBaos.toByteArray());
            }

            // 2. Render back (if enabled)
            if (hasBack) {
                String backImageName = resolveBackImageName(row, template);
                if (backImageName != null && !backImageName.isEmpty()) {
                    try (PDDocument backDoc = new PDDocument()) {
                        PDPage page = new PDPage(cardRect);
                        backDoc.addPage(page);
                        try (PDPageContentStream cs = new PDPageContentStream(backDoc, page)) {
                            cardRenderService.drawCardBack(backDoc, cs, template, backImageName, 0, 0);
                        }
                        BufferedImage backImage = renderCard(backDoc);
                        ByteArrayOutputStream backBaos = new ByteArrayOutputStream();
                        ImageIO.write(backImage, imgFormat, backBaos);

                        zipContents.put("carta_" + cardNum + "_verso." + extension, backBaos.toByteArray());
                    }
                }
            }
        }

        return zipExportService.createZip(zipContents);
    }

    private BufferedImage renderCard(PDDocument cardDoc) throws Exception {
        org.apache.pdfbox.pdmodel.PDPage page = cardDoc.getPage(0);
        float scale = AppConstants.IMAGE_RENDER_DPI / AppConstants.PDF_POINTS_PER_INCH;
        int w = Math.round(page.getBBox().getWidth()  * scale);
        int h = Math.round(page.getBBox().getHeight() * scale);

        // JPEG / PNG — render onto white background
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        java.awt.Graphics2D g = img.createGraphics();
        g.setColor(Color.WHITE);
        g.fillRect(0, 0, w, h);
        new PDFRenderer(cardDoc).renderPageToGraphics(0, g, scale);
        g.dispose();
        return img;
    }

    private String resolveBackImageName(Map<String, String> cardData, TemplateConfigDTO template) {
        String type = template.getCardBackType();
        if ("default".equalsIgnoreCase(type)) {
            return template.getCardBackValue();
        } else if ("column".equalsIgnoreCase(type)) {
            String colName = template.getCardBackValue();
            if (colName != null && !colName.isBlank()) {
                return cardData.getOrDefault(colName, "");
            }
        }
        return null;
    }
}
