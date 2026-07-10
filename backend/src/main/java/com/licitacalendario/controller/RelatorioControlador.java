package com.licitacalendario.controller;

import com.licitacalendario.dto.RelatorioDTO;
import com.licitacalendario.service.RelatorioServico;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class RelatorioControlador {

    private final RelatorioServico servico;

    public RelatorioControlador(RelatorioServico servico) {
        this.servico = servico;
    }

    @GetMapping("/diario")
    public ResponseEntity<RelatorioDTO> diario(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(servico.diario(data));
    }

    @GetMapping("/semanal")
    public ResponseEntity<RelatorioDTO> semanal(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return ResponseEntity.ok(servico.semanal(data));
    }

    @GetMapping("/completo")
    public ResponseEntity<RelatorioDTO> completo(@RequestParam(required = false) Long processoId) {
        return ResponseEntity.ok(servico.completo(processoId));
    }

    @GetMapping("/diario/csv")
    public ResponseEntity<String> diarioCsv(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return csvResponse(servico.diario(data), "relatorio-diario.csv");
    }

    @GetMapping("/semanal/csv")
    public ResponseEntity<String> semanalCsv(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        return csvResponse(servico.semanal(data), "relatorio-semanal.csv");
    }

    @GetMapping("/completo/csv")
    public ResponseEntity<String> completoCsv(@RequestParam(required = false) Long processoId) {
        return csvResponse(servico.completo(processoId), "relatorio-completo.csv");
    }

    private ResponseEntity<String> csvResponse(RelatorioDTO relatorio, String nomeArquivo) {
        String csv = servico.paraCsv(relatorio);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nomeArquivo + "\"")
                .body(new String(csv.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8));
    }
}
