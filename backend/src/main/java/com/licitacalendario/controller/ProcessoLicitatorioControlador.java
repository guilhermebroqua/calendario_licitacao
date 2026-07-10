package com.licitacalendario.controller;

import com.licitacalendario.dto.*;
import com.licitacalendario.model.FiltroEtapa;
import com.licitacalendario.model.StatusProcesso;
import com.licitacalendario.service.ProcessoLicitatorioServico;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/processos")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class ProcessoLicitatorioControlador {

    private final ProcessoLicitatorioServico servico;

    public ProcessoLicitatorioControlador(ProcessoLicitatorioServico servico) {
        this.servico = servico;
    }

    @PostMapping
    public ResponseEntity<ProcessoComEtapasDTO> criar(@Valid @RequestBody ProcessoLicitatorioDTO dto) {
        return ResponseEntity.status(201).body(servico.criar(dto));
    }

    @PostMapping("/sincronizar")
    public ResponseEntity<Integer> sincronizar() {
        return ResponseEntity.ok(servico.sincronizarM4());
    }

    @GetMapping
    public ResponseEntity<List<ProcessoComEtapasDTO>> listar(
            @RequestParam(required = false) StatusProcesso status,
            @RequestParam(required = false) Boolean favorito) {
        return ResponseEntity.ok(servico.listar(status, favorito));
    }

    @GetMapping("/resumo")
    public ResponseEntity<ResumoProcessosDTO> resumo() {
        return ResponseEntity.ok(servico.resumo());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcessoComEtapasDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.buscarPorId(id));
    }

    @PutMapping("/{id}/favorito")
    public ResponseEntity<ProcessoComEtapasDTO> favoritar(@PathVariable Long id, @RequestBody FavoritarDTO dto) {
        return ResponseEntity.ok(servico.favoritar(id, dto.isFavorito()));
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<ProcessoComEtapasDTO> finalizar(@PathVariable Long id) {
        return ResponseEntity.ok(servico.finalizar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        servico.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/etapas")
    public ResponseEntity<List<EtapaProcessoDTO>> listarEtapas(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "TODAS") FiltroEtapa filtro) {
        return ResponseEntity.ok(servico.listarEtapas(id, filtro));
    }

    @GetMapping("/etapas")
    public ResponseEntity<List<EtapaProcessoDTO>> listarTodasEtapas(
            @RequestParam(required = false, defaultValue = "TODAS") FiltroEtapa filtro) {
        return ResponseEntity.ok(servico.listarTodasEtapas(filtro));
    }

    @PutMapping("/etapas/{etapaId}/concluir")
    public ResponseEntity<EtapaProcessoDTO> concluirEtapa(@PathVariable Long etapaId, @RequestBody ConcluirEtapaDTO dto) {
        return ResponseEntity.ok(servico.concluirEtapa(etapaId, dto.isConcluida()));
    }

    @PutMapping("/etapas/{etapaId}/reagendar")
    public ResponseEntity<EtapaProcessoDTO> reagendarEtapa(@PathVariable Long etapaId, @Valid @RequestBody ReagendarEtapaDTO dto) {
        return ResponseEntity.ok(servico.reagendarEtapa(etapaId, dto.getNovaData()));
    }

    @PostMapping("/etapas/{etapaId}/anotacoes")
    public ResponseEntity<AnotacaoDTO> adicionarAnotacao(@PathVariable Long etapaId, @Valid @RequestBody AnotacaoDTO dto) {
        return ResponseEntity.status(201).body(servico.adicionarAnotacao(etapaId, dto));
    }

    @GetMapping("/etapas/{etapaId}/anotacoes")
    public ResponseEntity<List<AnotacaoDTO>> listarAnotacoes(@PathVariable Long etapaId) {
        return ResponseEntity.ok(servico.listarAnotacoes(etapaId));
    }
}
