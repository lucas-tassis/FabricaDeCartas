package br.com.lteengenharia.fabricadecartas.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ColumnType {
    TEXT("text"), IMAGE("image"), BORDAS("bordas");

    private final String value;

    ColumnType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ColumnType fromValue(String value) {
        if (value == null) return TEXT;
        for (ColumnType type : values()) {
            if (type.value.equalsIgnoreCase(value)) return type;
        }
        return TEXT;
    }
}
