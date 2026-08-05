package br.com.lteengenharia.fabricadecartas.dto;

import lombok.Data;
import java.util.List;

@Data
public class TemplateConfigDTO {
    private double cardWidth;
    private double cardHeight;
    private List<ColumnConfigDTO> columns;
    private String cardBorderColor;   // hex, e.g. "#000000"; null/blank = black
    private double cardBorderThickness; // pt; 0 = no border
    private String cardBackType = "none";      // "none", "default", "column"
    private String cardBackValue = "";         // default image name or column name
    private String cardBackDirection = "separate"; // "interleaved" or "separate"
    private String cardBackFit = "cover";      // "cover", "contain", "fill", "none", "smart"
    private boolean rotate90ForPrint = false;  // rotate card 90 degrees when laying out on PDF
}
