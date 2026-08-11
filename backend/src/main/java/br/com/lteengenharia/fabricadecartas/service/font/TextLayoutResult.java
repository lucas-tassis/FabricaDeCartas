package br.com.lteengenharia.fabricadecartas.service.font;

import java.util.List;

public record TextLayoutResult(
        float fontSize,
        List<String> lines,
        float totalTextHeight,
        float maxLineWidth,
        float leading,
        float singleLineCapHeight
) {
}
