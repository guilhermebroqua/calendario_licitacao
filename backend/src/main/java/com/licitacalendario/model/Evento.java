package com.licitacalendario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "eventos")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O campo título é obrigatório")
    @Column(nullable = false)
    private String titulo;

    @NotNull(message = "A data de início é obrigatória")
    @Column(nullable = false)
    private LocalDateTime dataInicio;

    @NotNull(message = "A data de fim é obrigatória")
    @Column(nullable = false)
    private LocalDateTime dataFim;

    private String descricao;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "A categoria é obrigatória")
    @Column(nullable = false)
    private CategoriaEvento categoria;

    private String processoLicitatorio;

    @ManyToOne
    @JoinColumn(name = "criado_por")
    private Usuario criadoPor;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    private LocalDateTime atualizadoEm;

    public boolean temConflito(Evento outro) {
        return this.dataInicio.isBefore(outro.dataFim)
                && this.dataFim.isAfter(outro.dataInicio);
    }

    public boolean isValido() {
        return dataFim != null && dataInicio != null
                && dataFim.isAfter(dataInicio);
    }

    @PreUpdate
    public void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

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
    public void setProcessoLicitatorio(String processoLicitatorio) { this.processoLicitatorio = processoLicitatorio; }
    public Usuario getCriadoPor() { return criadoPor; }
    public void setCriadoPor(Usuario criadoPor) { this.criadoPor = criadoPor; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
}
