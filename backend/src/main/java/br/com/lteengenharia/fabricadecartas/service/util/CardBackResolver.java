package br.com.lteengenharia.fabricadecartas.service.util;

import br.com.lteengenharia.fabricadecartas.dto.TemplateConfigDTO;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CardBackResolver {

    public String resolveBackImageName(Map<String, String> cardData, TemplateConfigDTO template) {
        if (template == null) return null;
        String type = template.getCardBackType();
        if ("default".equalsIgnoreCase(type)) {
            return template.getCardBackValue();
        } else if ("column".equalsIgnoreCase(type)) {
            String colName = template.getCardBackValue();
            if (colName != null && !colName.isBlank() && cardData != null) {
                return cardData.getOrDefault(colName, "");
            }
        }
        return null;
    }
}
