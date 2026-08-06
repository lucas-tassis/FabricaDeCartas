package br.com.lteengenharia.fabricadecartas.service.font;

import org.apache.pdfbox.pdmodel.font.PDFont;
import org.springframework.stereotype.Service;

import java.text.Normalizer;

@Service
public class PdfFontSanitizer {

    public String sanitizeTextForFont(PDFont font, String text) {
        if (text == null || text.isEmpty()) return "";
        text = text.replace("\n", " ").replace("\r", " ");
        text = Normalizer.normalize(text, Normalizer.Form.NFC);

        StringBuilder cleanText = new StringBuilder();
        for (int i = 0; i < text.length(); ) {
            int codePoint = text.codePointAt(i);
            int charCount = Character.charCount(codePoint);
            String strChar = new String(Character.toChars(codePoint));
            i += charCount;

            try {
                font.encode(strChar);
                cleanText.append(strChar);
            } catch (Exception e) {
                // If character is unencodable by font, fallback to ASCII transliteration
                String asciiFallback = Normalizer.normalize(strChar, Normalizer.Form.NFD)
                        .replaceAll("\\p{M}", "");
                try {
                    font.encode(asciiFallback);
                    cleanText.append(asciiFallback);
                } catch (Exception ex) {
                    // Omit unencodable character safely
                }
            }
        }
        return cleanText.toString();
    }
}
