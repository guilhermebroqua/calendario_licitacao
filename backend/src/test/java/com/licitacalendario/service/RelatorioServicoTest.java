package com.licitacalendario.service;

import com.licitacalendario.dto.RelatorioDTO;
import com.licitacalendario.model.EtapaProcesso;
import com.licitacalendario.model.ProcessoLicitatorio;
import com.licitacalendario.model.TipoEtapa;
import com.licitacalendario.repository.EtapaProcessoRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RelatorioServicoTest {

    @Mock private EtapaProcessoRepositorio etapaRepositorio;
    private RelatorioServico servico;

    @BeforeEach
    void setUp() {
        servico = new RelatorioServico(etapaRepositorio);
    }

    private EtapaProcesso etapa(Long processoId, String numero, String cliente, TipoEtapa tipo, LocalDateTime data, boolean concluida) {
        ProcessoLicitatorio p = new ProcessoLicitatorio();
        p.setId(processoId);
        p.setNumeroProcesso(numero);
        p.setCliente(cliente);
        p.setDataAbertura(data);

        EtapaProcesso e = new EtapaProcesso();
        e.setProcesso(p);
        e.setTipo(tipo);
        e.setDataPrevista(data);
        if (concluida) e.concluir();
        return e;
    }

    @Test
    @DisplayName("relatório diário agrupa etapas do dia indicando processo e cliente")
    void deveGerarRelatorioDiario() {
        LocalDate hoje = LocalDate.of(2026, 7, 8);
        EtapaProcesso e1 = etapa(1L, "PE 045/2026", "Prefeitura X", TipoEtapa.PREPARAR_DOCUMENTACAO, hoje.atTime(9, 0), false);
        when(etapaRepositorio.buscarPorPeriodo(any(), any())).thenReturn(List.of(e1));

        RelatorioDTO relatorio = servico.diario(hoje);

        assertThat(relatorio.getTipo()).isEqualTo("DIARIO");
        assertThat(relatorio.getItens()).hasSize(1);
        assertThat(relatorio.getItens().get(0).getNumeroProcesso()).isEqualTo("PE 045/2026");
        assertThat(relatorio.getItens().get(0).getCliente()).isEqualTo("Prefeitura X");
    }

    @Test
    @DisplayName("relatório semanal cobre de segunda a domingo da semana de referência")
    void deveGerarRelatorioSemanalComPeriodoCorreto() {
        LocalDate quarta = LocalDate.of(2026, 7, 8);
        when(etapaRepositorio.buscarPorPeriodo(any(), any())).thenReturn(List.of());

        RelatorioDTO relatorio = servico.semanal(quarta);

        assertThat(relatorio.getPeriodoInicio()).isEqualTo(LocalDate.of(2026, 7, 6));
        assertThat(relatorio.getPeriodoFim()).isEqualTo(LocalDate.of(2026, 7, 12));
    }

    @Test
    @DisplayName("relatório completo filtra por processoId quando informado")
    void deveGerarRelatorioCompletoFiltradoPorProcesso() {
        EtapaProcesso doProcesso1 = etapa(1L, "PE 045/2026", "Prefeitura X", TipoEtapa.DATA_ABERTURA_SESSAO, LocalDateTime.of(2026, 8, 1, 9, 0), false);
        EtapaProcesso doProcesso2 = etapa(2L, "PE 099/2026", "Prefeitura Y", TipoEtapa.DATA_ABERTURA_SESSAO, LocalDateTime.of(2026, 8, 2, 9, 0), false);
        when(etapaRepositorio.buscarTodasOrdenadas()).thenReturn(List.of(doProcesso1, doProcesso2));

        RelatorioDTO relatorio = servico.completo(1L);

        assertThat(relatorio.getTipo()).isEqualTo("COMPLETO");
        assertThat(relatorio.getItens()).hasSize(1);
        assertThat(relatorio.getItens().get(0).getProcessoId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("relatório completo sem processoId retorna etapas de todos os processos")
    void deveGerarRelatorioCompletoSemFiltro() {
        EtapaProcesso doProcesso1 = etapa(1L, "PE 045/2026", "Prefeitura X", TipoEtapa.DATA_ABERTURA_SESSAO, LocalDateTime.of(2026, 8, 1, 9, 0), false);
        EtapaProcesso doProcesso2 = etapa(2L, "PE 099/2026", "Prefeitura Y", TipoEtapa.DATA_ABERTURA_SESSAO, LocalDateTime.of(2026, 8, 2, 9, 0), false);
        when(etapaRepositorio.buscarTodasOrdenadas()).thenReturn(List.of(doProcesso1, doProcesso2));

        RelatorioDTO relatorio = servico.completo(null);

        assertThat(relatorio.getItens()).hasSize(2);
    }

    @Test
    @DisplayName("contadores de concluídos e atrasados são calculados corretamente")
    void deveContarConcluidosEAtrasados() {
        EtapaProcesso concluida = etapa(1L, "PE 045/2026", "Prefeitura X", TipoEtapa.RESUMO_EDITAL, LocalDateTime.now().minusDays(1), true);
        EtapaProcesso atrasada = etapa(1L, "PE 045/2026", "Prefeitura X", TipoEtapa.PREPARAR_DOCUMENTACAO, LocalDateTime.now().minusDays(2), false);
        when(etapaRepositorio.buscarPorPeriodo(any(), any())).thenReturn(List.of(concluida, atrasada));

        RelatorioDTO relatorio = servico.diario(LocalDate.now());

        assertThat(relatorio.getTotalConcluidos()).isEqualTo(1);
        assertThat(relatorio.getTotalAtrasados()).isEqualTo(1);
    }

    @Test
    @DisplayName("exportação CSV inclui cabeçalho e uma linha por etapa")
    void deveExportarCsvComCabecalhoELinhas() {
        EtapaProcesso e1 = etapa(1L, "PE 045/2026", "Prefeitura X", TipoEtapa.PREPARAR_DOCUMENTACAO, LocalDateTime.of(2026, 7, 8, 9, 0), false);
        RelatorioDTO relatorio = new RelatorioDTO("DIARIO", LocalDate.now(), LocalDate.now(),
                List.of(com.licitacalendario.dto.RelatorioItemDTO.de(e1)));

        String csv = servico.paraCsv(relatorio);

        assertThat(csv).startsWith("processo,cliente,etapa,data_prevista,concluida,atrasada\n");
        assertThat(csv).contains("PE 045/2026").contains("Prefeitura X");
    }

    @Test
    @DisplayName("exportação CSV escapa campos com vírgula")
    void deveEscaparCamposComVirgulaNoCsv() {
        EtapaProcesso e1 = etapa(1L, "PE 045/2026", "Prefeitura X, Secretaria de Obras", TipoEtapa.PREPARAR_DOCUMENTACAO, LocalDateTime.of(2026, 7, 8, 9, 0), false);
        RelatorioDTO relatorio = new RelatorioDTO("DIARIO", LocalDate.now(), LocalDate.now(),
                List.of(com.licitacalendario.dto.RelatorioItemDTO.de(e1)));

        String csv = servico.paraCsv(relatorio);

        assertThat(csv).contains("\"Prefeitura X, Secretaria de Obras\"");
    }
}
