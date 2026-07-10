package com.licitacalendario.dto;

import com.licitacalendario.model.Anotacao;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class AnotacaoDTO {
    private Long id;

    @NotBlank(message = "O autor da anotação é obrigatório")
    private String autor;

    @NotBlank(message = "O texto da anotação é obrigatório")
    private String texto;

    private LocalDateTime criadoEm;

    public static AnotacaoDTO de(Anotacao a) {
        AnotacaoDTO dto = new AnotacaoDTO();
        dto.id = a.getId();
        dto.autor = a.getAutor();
        dto.texto = a.getTexto();
        dto.criadoEm = a.getCriadoEm();
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
