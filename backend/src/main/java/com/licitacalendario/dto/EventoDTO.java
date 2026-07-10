package com.licitacalendario.dto;

import com.licitacalendario.model.CategoriaEvento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class EventoDTO {

    private Long id;

    @NotBlank(message = "O campo título é obrigatório")
    private String titulo;

    @NotNull(message = "A data de início é obrigatória")
    private LocalDateTime dataInicio;

    @NotNull(message = "A data de fim é obrigatória")
    private LocalDateTime dataFim;

    private String descricao;

    @NotNull(message = "A categoria é obrigatória")
    private CategoriaEvento categoria;

    private String processoLicitatorio;

    private int diasAlerta = 3;

    private boolean ignorarConflito = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public LocalDateTime getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDateTime dataInicio) { this.dataInicio = dataInicio; }
    public LocalDateTime getDataFim() { return dataFim; }
    public void setDataFim(LocalDateTime dataFim) { this.dataFim = dataFim; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public CategoriaEvento getCategoria() { return categoria; }
    public void setCategoria(CategoriaEvento categoria) { this.categoria = categoria; }
    public String getProcessoLicitatorio() { return processoLicitatorio; }
    public void setProcessoLicitatorio(String p) { this.processoLicitatorio = p; }
    public int getDiasAlerta() { return diasAlerta; }
    public void setDiasAlerta(int diasAlerta) { this.diasAlerta = diasAlerta; }
    public boolean isIgnorarConflito() { return ignorarConflito; }
    public void setIgnorarConflito(boolean ignorarConflito) { this.ignorarConflito = ignorarConflito; }
}
