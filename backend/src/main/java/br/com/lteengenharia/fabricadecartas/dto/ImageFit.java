package br.com.lteengenharia.fabricadecartas.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ImageFit {
    FILL("fill"), CONTAIN("contain"), COVER("cover"), SMART("smart"), NONE("none");

    private final String value;

    ImageFit(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ImageFit fromValue(String value) {
        if (value == null) return FILL;
        for (ImageFit fit : values()) {
            if (fit.value.equalsIgnoreCase(value)) return fit;
        }
        return FILL;
    }
}
