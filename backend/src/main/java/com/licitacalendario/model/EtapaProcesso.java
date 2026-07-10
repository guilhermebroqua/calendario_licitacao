package com.licitacalendario.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "etapas_processo")
public class EtapaProcesso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "processo_id", nullable = false)
    private ProcessoLicitatorio processo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoEtapa tipo;

    private LocalDateTime dataPrevista;

    @Column(nullable = false)
    private boolean concluida = false;

    private LocalDateTime concluidaEm;

    @Column(nullable = false)
    private boolean aguardandoConvocacao = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public void concluir() {
        this.concluida = true;
        this.concluidaEm = LocalDateTime.now();
    }

    public void reabrir() {
        this.concluida = false;
        this.concluidaEm = null;
    }

    public boolean isAtrasada() {
        return !concluida && dataPrevista != null && dataPrevista.isBefore(LocalDateTime.now());
    }

    public boolean isHoje() {
        return dataPrevista != null && dataPrevista.toLocalDate().isEqual(LocalDateTime.now().toLocalDate());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProcessoLicitatorio getProcesso() { return processo; }
    public void setProcesso(ProcessoLicitatorio processo) { this.processo = processo; }
    public TipoEtapa getTipo() { return tipo; }
    public void setTipo(TipoEtapa tipo) { this.tipo = tipo; }
    public LocalDateTime getDataPrevista() { return dataPrevista; }
    public void setDataPrevista(LocalDateTime dataPrevista) { this.dataPrevista = dataPrevista; }
    public boolean isConcluida() { return concluida; }
    public void setConcluida(boolean concluida) { this.concluida = concluida; }
    public LocalDateTime getConcluidaEm() { return concluidaEm; }
    public void setConcluidaEm(LocalDateTime concluidaEm) { this.concluidaEm = concluidaEm; }
    public boolean isAguardandoConvocacao() { return aguardandoConvocacao; }
    public void setAguardandoConvocacao(boolean aguardandoConvocacao) { this.aguardandoConvocacao = aguardandoConvocacao; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}
