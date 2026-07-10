package com.licitacalendario.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertas")
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @Column(nullable = false)
    private int diasAntecedencia;

    @Column(nullable = false)
    private boolean enviado = false;

    private LocalDateTime dataEnvio;

    public void disparar() {
        this.enviado = true;
        this.dataEnvio = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
    public int getDiasAntecedencia() { return diasAntecedencia; }
    public void setDiasAntecedencia(int diasAntecedencia) { this.diasAntecedencia = diasAntecedencia; }
    public boolean isEnviado() { return enviado; }
    public LocalDateTime getDataEnvio() { return dataEnvio; }
}
