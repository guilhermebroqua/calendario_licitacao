package com.licitacalendario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "anotacoes")
public class Anotacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "etapa_id", nullable = false)
    private EtapaProcesso etapa;

    @NotBlank(message = "O autor da anotação é obrigatório")
    @Column(nullable = false)
    private String autor;

    @NotBlank(message = "O texto da anotação é obrigatório")
    @Column(nullable = false, length = 2000)
    private String texto;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public EtapaProcesso getEtapa() { return etapa; }
    public void setEtapa(EtapaProcesso etapa) { this.etapa = etapa; }
    public String getAutor() { return autor; }
    public void setAutor(String autor) { this.autor = autor; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}
