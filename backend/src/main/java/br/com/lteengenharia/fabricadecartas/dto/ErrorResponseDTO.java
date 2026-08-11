package br.com.lteengenharia.fabricadecartas.dto;

import java.time.LocalDateTime;

public class ErrorResponseDTO {
    private final String message;
    private final int status;
    private final LocalDateTime timestamp;

    public ErrorResponseDTO(String message, int status) {
        this.message = message;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public String getMessage() {
        return message;
    }

    public int getStatus() {
        return status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
