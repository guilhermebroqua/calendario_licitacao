package com.licitacalendario.service;

import com.licitacalendario.dto.RelatorioDTO;
import com.licitacalendario.dto.RelatorioItemDTO;
import com.licitacalendario.model.EtapaProcesso;
import com.licitacalendario.repository.EtapaProcessoRepositorio;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelatorioServico {

    private final EtapaProcessoRepositorio etapaRepositorio;

    public RelatorioServico(EtapaProcessoRepositorio etapaRepositorio) {
        this.etapaRepositorio = etapaRepositorio;
    }

    public RelatorioDTO diario(LocalDate dia) {
        LocalDate d = dia != null ? dia : LocalDate.now();
        LocalDateTime inicio = LocalDateTime.of(d, LocalTime.MIN);
        LocalDateTime fim = LocalDateTime.of(d.plusDays(1), LocalTime.MIN);
        return montar("DIARIO", d, d, inicio, fim);
    }

    public RelatorioDTO semanal(LocalDate referencia) {
        LocalDate ref = referencia != null ? referencia : LocalDate.now();
        LocalDate inicioSemana = ref.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate fimSemana = inicioSemana.plusDays(6);
        LocalDateTime inicio = LocalDateTime.of(inicioSemana, LocalTime.MIN);
        LocalDateTime fim = LocalDateTime.of(fimSemana.plusDays(1), LocalTime.MIN);
        return montar("SEMANAL", inicioSemana, fimSemana, inicio, fim);
    }

    public RelatorioDTO completo(Long processoId) {
        List<EtapaProcesso> etapas = etapaRepositorio.buscarTodasOrdenadas().stream()
                .filter(e -> processoId == null || e.getProcesso().getId().equals(processoId))
                .filter(e -> e.getDataPrevista() != null)
                .collect(Collectors.toList());
        List<RelatorioItemDTO> itens = paraItens(etapas);
        LocalDate inicio = itens.stream().map(i -> i.getDataPrevista().toLocalDate()).min(LocalDate::compareTo).orElse(null);
        LocalDate fim = itens.stream().map(i -> i.getDataPrevista().toLocalDate()).max(LocalDate::compareTo).orElse(null);
        return new RelatorioDTO("COMPLETO", inicio, fim, itens);
    }

    public String paraCsv(RelatorioDTO relatorio) {
        StringBuilder sb = new StringBuilder();
        sb.append("processo,cliente,etapa,data_prevista,concluida,atrasada\n");
        for (RelatorioItemDTO item : relatorio.getItens()) {
            sb.append(csv(item.getNumeroProcesso())).append(',')
              .append(csv(item.getCliente())).append(',')
              .append(csv(item.getLabelEtapa())).append(',')
              .append(item.getDataPrevista() != null ? item.getDataPrevista() : "").append(',')
              .append(item.isConcluida()).append(',')
              .append(item.isAtrasada()).append('\n');
        }
        return sb.toString();
    }

    private String csv(String valor) {
        if (valor == null) return "";
        String escapado = valor.replace("\"", "\"\"");
        return escapado.contains(",") || escapado.contains("\"") || escapado.contains("\n")
                ? "\"" + escapado + "\""
                : escapado;
    }

    private RelatorioDTO montar(String tipo, LocalDate periodoInicio, LocalDate periodoFim,
                                 LocalDateTime inicio, LocalDateTime fim) {
        List<EtapaProcesso> etapas = etapaRepositorio.buscarPorPeriodo(inicio, fim);
        return new RelatorioDTO(tipo, periodoInicio, periodoFim, paraItens(etapas));
    }

    private List<RelatorioItemDTO> paraItens(List<EtapaProcesso> etapas) {
        return etapas.stream().map(RelatorioItemDTO::de).collect(Collectors.toList());
    }
}
