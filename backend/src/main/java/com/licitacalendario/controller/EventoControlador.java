package com.licitacalendario.controller;

import com.licitacalendario.dto.EventoDTO;
import com.licitacalendario.model.Evento;
import com.licitacalendario.service.EventoServico;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class EventoControlador {

    private final EventoServico servico;

    public EventoControlador(EventoServico servico) {
        this.servico = servico;
    }

    @GetMapping
    public ResponseEntity<List<Evento>> listar(
            @RequestParam int ano,
            @RequestParam int mes) {
        return ResponseEntity.ok(servico.listarPorMes(ano, mes));
    }

    @PostMapping
    public ResponseEntity<Evento> criar(@Valid @RequestBody EventoDTO dto) {
        Evento criado = servico.criar(dto);
        return ResponseEntity.status(201).body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evento> editar(
            @PathVariable Long id,
            @Valid @RequestBody EventoDTO dto) {
        return ResponseEntity.ok(servico.editar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id,
            @RequestParam(required = false) String justificativa) {
        servico.excluir(id, justificativa);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alertas")
    public ResponseEntity<List<Evento>> alertas(
            @RequestParam(defaultValue = "7") int dias) {
        return ResponseEntity.ok(servico.buscarEventosParaAlertar(dias));
    }

    @PostMapping("/conflitos")
    public ResponseEntity<Map<String, Object>> conflitos(@RequestBody EventoDTO dto) {
        List<Evento> conflitos = servico.verificarConflitos(dto);
        return ResponseEntity.ok(Map.of(
                "temConflito", !conflitos.isEmpty(),
                "conflitos", conflitos
        ));
    }
}
