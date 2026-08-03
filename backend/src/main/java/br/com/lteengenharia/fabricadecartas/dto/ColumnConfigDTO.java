package br.com.lteengenharia.fabricadecartas.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ColumnConfigDTO {
    private String columnName;
    private double x;
    private double y;
    private double fontSize;
    private String color;
    private boolean bold;
    private String textAlign;

    @JsonProperty("vAlign")
    private String vAlign;

    private double width;
    private double height;
    private double borderThickness;
    private ColumnType type = ColumnType.TEXT;
    private ImageFit imageFit = ImageFit.FILL;
    private String colorSpace = "RGB";   // "RGB" or "CMYK" — used for BORDAS type
    private String backgroundColor;      // optional hex fill behind TEXT or IMAGE sections
    private double[][] squareRects;  // individual square rects [x,y,w,h] in points, used by BORDAS
    private String fontFamily = "Helvetica"; // "Helvetica", "Times", or "Courier"
    private double rotation = 0;             // degrees, counter-clockwise (PDF convention)
    private Integer brightness = 100;        // brightness percentage (default 100)
    private Integer contrast = 100;          // contrast percentage (default 100)
}
