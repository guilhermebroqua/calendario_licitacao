package com.licitacalendario.dto;

public class ResumoProcessosDTO {
    private long totalGerenciadas;
    private long totalFavoritas;
    private long totalTarefasPendentes;
    private long totalAndamento;
    private long totalFinalizadas;

    public ResumoProcessosDTO(long totalGerenciadas, long totalFavoritas, long totalTarefasPendentes,
                              long totalAndamento, long totalFinalizadas) {
        this.totalGerenciadas = totalGerenciadas;
        this.totalFavoritas = totalFavoritas;
        this.totalTarefasPendentes = totalTarefasPendentes;
        this.totalAndamento = totalAndamento;
        this.totalFinalizadas = totalFinalizadas;
    }

    public long getTotalGerenciadas() { return totalGerenciadas; }
    public long getTotalFavoritas() { return totalFavoritas; }
    public long getTotalTarefasPendentes() { return totalTarefasPendentes; }
    public long getTotalAndamento() { return totalAndamento; }
    public long getTotalFinalizadas() { return totalFinalizadas; }
}
