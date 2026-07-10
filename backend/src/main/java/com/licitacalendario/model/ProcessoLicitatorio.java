package com.licitacalendario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "processos_licitatorios")
public class ProcessoLicitatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O cliente/órgão é obrigatório")
    @Column(nullable = false)
    private String cliente;

    @NotBlank(message = "O número do processo/edital é obrigatório")
    @Column(nullable = false)
    private String numeroProcesso;

    private String objeto;

    @NotNull(message = "A data de abertura é obrigatória")
    @Column(nullable = false)
    private LocalDateTime dataAbertura;

    @Column(nullable = false)
    private int diasUteisDocumentacao = 5;

    @Column(nullable = false)
    private boolean favorito = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusProcesso status = StatusProcesso.EM_ANDAMENTO;

    @ManyToOne
    @JoinColumn(name = "criado_por")
    private Usuario criadoPor;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    private LocalDateTime atualizadoEm;

    @PreUpdate
    public void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public StatusProcesso getStatus() { return status; }
    public void setStatus(StatusProcesso status) { this.status = status; }
    public Usuario getCriadoPor() { return criadoPor; }
    public void setCriadoPor(Usuario criadoPor) { this.criadoPor = criadoPor; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
}
