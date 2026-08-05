package br.com.lteengenharia.fabricadecartas;

import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

import java.text.Normalizer;

import static org.junit.jupiter.api.Assertions.*;

public class FontEncodingTest {

    @Test
    public void testPortugueseAccentsWithStandard14Font() throws Exception {
        PDType1Font font = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        String original = "Ação, Proteção, Dragão, Poção, Mágica, Cão, Êxito, Água, Ânimo, Avó, Avô, Maçã";

        String normalized = Normalizer.normalize(original, Normalizer.Form.NFC);

        StringBuilder cleanText = new StringBuilder();
        for (int i = 0; i < normalized.length(); ) {
            int codePoint = normalized.codePointAt(i);
            int charCount = Character.charCount(codePoint);
            String strChar = new String(Character.toChars(codePoint));
            i += charCount;
            try {
                font.encode(strChar);
                cleanText.append(strChar);
            } catch (Exception e) {
                // Fallback to ASCII transliteration if character is unencodable by font
                String asciiFallback = Normalizer.normalize(strChar, Normalizer.Form.NFD)
                        .replaceAll("\\p{M}", "");
                try {
                    font.encode(asciiFallback);
                    cleanText.append(asciiFallback);
                } catch (Exception ex) {
                    // Ignore unencodable character
                }
            }
        }

        String result = cleanText.toString();
        System.out.println("Original   : " + original);
        System.out.println("Clean Text : " + result);

        assertEquals(original, result, "Todos os caracteres acentuados em português devem ser preservados!");
    }
}
