package com.licitacalendario.dto;

import com.licitacalendario.model.EtapaProcesso;
import com.licitacalendario.model.TipoEtapa;
import java.time.LocalDateTime;

public class EtapaProcessoDTO {
    private Long id;
    private Long processoId;
    private TipoEtapa tipo;
    private String label;
    private LocalDateTime dataPrevista;
    private boolean concluida;
    private LocalDateTime concluidaEm;
    private boolean aguardandoConvocacao;
    private boolean atrasada;
    private boolean hoje;

    public static EtapaProcessoDTO de(EtapaProcesso e) {
        EtapaProcessoDTO dto = new EtapaProcessoDTO();
        dto.id = e.getId();
        dto.processoId = e.getProcesso().getId();
        dto.tipo = e.getTipo();
        dto.label = e.getTipo().getLabel();
        dto.dataPrevista = e.getDataPrevista();
        dto.concluida = e.isConcluida();
        dto.concluidaEm = e.getConcluidaEm();
        dto.aguardandoConvocacao = e.isAguardandoConvocacao();
        dto.atrasada = e.isAtrasada();
        dto.hoje = e.isHoje();
        return dto;
    }

    public Long getId() { return id; }
    public Long getProcessoId() { return processoId; }
    public TipoEtapa getTipo() { return tipo; }
    public String getLabel() { return label; }
    public LocalDateTime getDataPrevista() { return dataPrevista; }
    public boolean isConcluida() { return concluida; }
    public LocalDateTime getConcluidaEm() { return concluidaEm; }
    public boolean isAguardandoConvocacao() { return aguardandoConvocacao; }
    public boolean isAtrasada() { return atrasada; }
    public boolean isHoje() { return hoje; }
}
