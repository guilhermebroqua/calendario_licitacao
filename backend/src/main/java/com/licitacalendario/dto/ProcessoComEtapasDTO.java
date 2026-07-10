package com.licitacalendario.dto;

import com.licitacalendario.model.ProcessoLicitatorio;
import com.licitacalendario.model.StatusProcesso;

import java.time.LocalDateTime;
import java.util.List;

public class ProcessoComEtapasDTO {
    private Long id;
    private String cliente;
    private String numeroProcesso;
    private String objeto;
    private LocalDateTime dataAbertura;
    private int diasUteisDocumentacao;
    private boolean favorito;
    private StatusProcesso status;
    private List<EtapaProcessoDTO> etapas;
    private int totalEtapas;
    private int etapasConcluidas;
    private int percentualConcluido;
    private List<String> avisosMesmoDia;

    public static ProcessoComEtapasDTO de(ProcessoLicitatorio p, List<EtapaProcessoDTO> etapas, List<String> avisos) {
        ProcessoComEtapasDTO dto = new ProcessoComEtapasDTO();
        dto.id = p.getId();
        dto.cliente = p.getCliente();
        dto.numeroProcesso = p.getNumeroProcesso();
        dto.objeto = p.getObjeto();
        dto.dataAbertura = p.getDataAbertura();
        dto.diasUteisDocumentacao = p.getDiasUteisDocumentacao();
        dto.favorito = p.isFavorito();
        dto.status = p.getStatus();
        dto.etapas = etapas;
        dto.totalEtapas = etapas.size();
        dto.etapasConcluidas = (int) etapas.stream().filter(EtapaProcessoDTO::isConcluida).count();
        dto.percentualConcluido = dto.totalEtapas == 0 ? 0 : Math.round(100f * dto.etapasConcluidas / dto.totalEtapas);
        dto.avisosMesmoDia = avisos;
        return dto;
    }

    public Long getId() { return id; }
    public String getCliente() { return cliente; }
    public String getNumeroProcesso() { return numeroProcesso; }
    public String getObjeto() { return objeto; }
    public LocalDateTime getDataAbertura() { return dataAbertura; }
    public int getDiasUteisDocumentacao() { return diasUteisDocumentacao; }
    public boolean isFavorito() { return favorito; }
    public StatusProcesso getStatus() { return status; }
    public List<EtapaProcessoDTO> getEtapas() { return etapas; }
    public int getTotalEtapas() { return totalEtapas; }
    public int getEtapasConcluidas() { return etapasConcluidas; }
    public int getPercentualConcluido() { return percentualConcluido; }
    public List<String> getAvisosMesmoDia() { return avisosMesmoDia; }
}
