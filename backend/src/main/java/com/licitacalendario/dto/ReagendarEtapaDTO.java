package com.licitacalendario.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ReagendarEtapaDTO {
    @NotNull(message = "A nova data é obrigatória")
    private LocalDateTime novaData;

    public LocalDateTime getNovaData() { return novaData; }
    public void setNovaData(LocalDateTime novaData) { this.novaData = novaData; }
}
