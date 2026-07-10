package com.licitacalendario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ProcessoLicitatorioDTO {

    @NotBlank(message = "O cliente/órgão é obrigatório")
    private String cliente;

    @NotBlank(message = "O número do processo/edital é obrigatório")
    private String numeroProcesso;

    private String objeto;

    @NotNull(message = "A data de abertura é obrigatória")
    private LocalDateTime dataAbertura;

    private int diasUteisDocumentacao = 5;

    private boolean favorito = false;

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public String getNumeroProcesso() { return numeroProcesso; }
    public void setNumeroProcesso(String numeroProcesso) { this.numeroProcesso = numeroProcesso; }
    public String getObjeto() { return objeto; }
    public void setObjeto(String objeto) { this.objeto = objeto; }
    public LocalDateTime getDataAbertura() { return dataAbertura; }
    public void setDataAbertura(LocalDateTime dataAbertura) { this.dataAbertura = dataAbertura; }
    public int getDiasUteisDocumentacao() { return diasUteisDocumentacao; }
    public void setDiasUteisDocumentacao(int diasUteisDocumentacao) { this.diasUteisDocumentacao = diasUteisDocumentacao; }
    public boolean isFavorito() { return favorito; }
    public void setFavorito(boolean favorito) { this.favorito = favorito; }
}
