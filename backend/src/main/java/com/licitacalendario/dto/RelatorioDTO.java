package com.licitacalendario.dto;

import java.time.LocalDate;
import java.util.List;

public class RelatorioDTO {
    private String tipo;
    private LocalDate periodoInicio;
    private LocalDate periodoFim;
    private List<RelatorioItemDTO> itens;
    private int totalItens;
    private long totalConcluidos;
    private long totalAtrasados;

    public RelatorioDTO(String tipo, LocalDate periodoInicio, LocalDate periodoFim, List<RelatorioItemDTO> itens) {
        this.tipo = tipo;
        this.periodoInicio = periodoInicio;
        this.periodoFim = periodoFim;
        this.itens = itens;
        this.totalItens = itens.size();
        this.totalConcluidos = itens.stream().filter(RelatorioItemDTO::isConcluida).count();
        this.totalAtrasados = itens.stream().filter(RelatorioItemDTO::isAtrasada).count();
    }

    public String getTipo() { return tipo; }
    public LocalDate getPeriodoInicio() { return periodoInicio; }
    public LocalDate getPeriodoFim() { return periodoFim; }
    public List<RelatorioItemDTO> getItens() { return itens; }
    public int getTotalItens() { return totalItens; }
    public long getTotalConcluidos() { return totalConcluidos; }
    public long getTotalAtrasados() { return totalAtrasados; }
}
