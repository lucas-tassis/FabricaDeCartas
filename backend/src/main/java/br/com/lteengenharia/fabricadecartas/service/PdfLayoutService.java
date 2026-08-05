package br.com.lteengenharia.fabricadecartas.service;

import br.com.lteengenharia.fabricadecartas.config.AppConstants;
import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Service
public class PdfLayoutService {

    private static final double PAGE_MARGIN_PT = AppConstants.DEFAULT_PAGE_MARGIN_PT;
    private static final double CARD_SPACING_PT = 0;

    private final CardRenderService cardRenderService;

    public PdfLayoutService(CardRenderService cardRenderService) {
        this.cardRenderService = cardRenderService;
    }

    public byte[] generate(List<Map<String, String>> data, TemplateConfigDTO template) throws Exception {
        try (PDDocument document = new PDDocument()) {
            PDRectangle a4 = PDRectangle.A4;
            double pageWidth = a4.getWidth();
            double pageHeight = a4.getHeight();
            double cardWidth = template.getCardWidth();
            double cardHeight = template.getCardHeight();
            boolean rotate90 = template.isRotate90ForPrint();

            double effectiveWidth = rotate90 ? cardHeight : cardWidth;
            double effectiveHeight = rotate90 ? cardWidth : cardHeight;

            int cardsPerRow = Math.max(1, (int) ((pageWidth - 2 * PAGE_MARGIN_PT + CARD_SPACING_PT) / (effectiveWidth + CARD_SPACING_PT)));
            int cardsPerCol = Math.max(1, (int) ((pageHeight - 2 * PAGE_MARGIN_PT + CARD_SPACING_PT) / (effectiveHeight + CARD_SPACING_PT)));
            int cardsPerPage = cardsPerRow * cardsPerCol;

            boolean hasBack = !"none".equalsIgnoreCase(template.getCardBackType());
            boolean interleaved = "interleaved".equalsIgnoreCase(template.getCardBackDirection());
            java.util.List<int[]> pageRanges = new java.util.ArrayList<>();

            int currentCard = 0;
            while (currentCard < data.size()) {
                int startCardIdx = currentCard;
                PDPage page = new PDPage(a4);
                document.addPage(page);
                try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                    for (int i = 0; i < cardsPerPage && currentCard < data.size(); i++) {
                        int row = i / cardsPerRow;
                        int col = i % cardsPerRow;
                        double startX = PAGE_MARGIN_PT + col * (effectiveWidth + CARD_SPACING_PT);
                        double startY = pageHeight - PAGE_MARGIN_PT - (row + 1) * effectiveHeight - row * CARD_SPACING_PT;
                        if (rotate90) {
                            contentStream.saveGraphicsState();
                            contentStream.transform(new org.apache.pdfbox.util.Matrix(0, -1, 1, 0, (float) startX, (float) (startY + cardWidth)));
                            cardRenderService.drawCard(document, contentStream, data.get(currentCard), template, 0, 0);
                            contentStream.restoreGraphicsState();
                        } else {
                            cardRenderService.drawCard(document, contentStream, data.get(currentCard), template, startX, startY);
                        }
                        currentCard++;
                    }
                }
                int endCardIdx = currentCard;

                if (hasBack) {
                    if (interleaved) {
                        drawBackPage(document, data, template, startCardIdx, endCardIdx, pageWidth, pageHeight, cardsPerRow, cardsPerCol);
                    } else {
                        pageRanges.add(new int[]{startCardIdx, endCardIdx});
                    }
                }
            }

            if (hasBack && !interleaved) {
                for (int[] range : pageRanges) {
                    drawBackPage(document, data, template, range[0], range[1], pageWidth, pageHeight, cardsPerRow, cardsPerCol);
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private void drawBackPage(PDDocument document, List<Map<String, String>> data,
                              TemplateConfigDTO template, int startCardIdx, int endCardIdx,
                              double pageWidth, double pageHeight, int cardsPerRow, int cardsPerCol) throws Exception {
        PDRectangle a4 = PDRectangle.A4;
        PDPage backPage = new PDPage(a4);
        document.addPage(backPage);

        double cardWidth = template.getCardWidth();
        double cardHeight = template.getCardHeight();
        boolean rotate90 = template.isRotate90ForPrint();

        double effectiveWidth = rotate90 ? cardHeight : cardWidth;
        double effectiveHeight = rotate90 ? cardWidth : cardHeight;

        try (PDPageContentStream contentStream = new PDPageContentStream(document, backPage)) {
            int cardsPerPage = cardsPerRow * cardsPerCol;
            for (int i = 0; i < cardsPerPage; i++) {
                int cardIdx = startCardIdx + i;
                if (cardIdx >= endCardIdx) {
                    break;
                }

                int row = i / cardsPerRow;
                // Mirror the column horizontally for correct print alignment
                int col = cardsPerRow - 1 - (i % cardsPerRow);

                double startX = PAGE_MARGIN_PT + col * (effectiveWidth + CARD_SPACING_PT);
                double startY = pageHeight - PAGE_MARGIN_PT - (row + 1) * effectiveHeight - row * CARD_SPACING_PT;

                String backImageName = resolveBackImageName(data.get(cardIdx), template);
                if (backImageName != null && !backImageName.isEmpty()) {
                    if (rotate90) {
                        contentStream.saveGraphicsState();
                        contentStream.transform(new org.apache.pdfbox.util.Matrix(0, -1, 1, 0, (float) startX, (float) (startY + cardWidth)));
                        cardRenderService.drawCardBack(document, contentStream, template, backImageName, 0, 0);
                        contentStream.restoreGraphicsState();
                    } else {
                        cardRenderService.drawCardBack(document, contentStream, template, backImageName, startX, startY);
                    }
                }
            }
        }
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
