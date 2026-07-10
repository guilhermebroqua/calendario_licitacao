package com.licitacalendario.dto;

import com.licitacalendario.model.EtapaProcesso;
import com.licitacalendario.model.ProcessoLicitatorio;
import java.time.LocalDateTime;

public class RelatorioItemDTO {
    private Long processoId;
    private String cliente;
    private String numeroProcesso;
    private String tipoEtapa;
    private String labelEtapa;
    private LocalDateTime dataPrevista;
    private boolean concluida;
    private boolean atrasada;

    public static RelatorioItemDTO de(EtapaProcesso e) {
        ProcessoLicitatorio p = e.getProcesso();
        RelatorioItemDTO dto = new RelatorioItemDTO();
        dto.processoId = p.getId();
        dto.cliente = p.getCliente();
        dto.numeroProcesso = p.getNumeroProcesso();
        dto.tipoEtapa = e.getTipo().name();
        dto.labelEtapa = e.getTipo().getLabel();
        dto.dataPrevista = e.getDataPrevista();
        dto.concluida = e.isConcluida();
        dto.atrasada = e.isAtrasada();
        return dto;
    }

    public Long getProcessoId() { return processoId; }
    public String getCliente() { return cliente; }
    public String getNumeroProcesso() { return numeroProcesso; }
    public String getTipoEtapa() { return tipoEtapa; }
    public String getLabelEtapa() { return labelEtapa; }
    public LocalDateTime getDataPrevista() { return dataPrevista; }
    public boolean isConcluida() { return concluida; }
    public boolean isAtrasada() { return atrasada; }
}
