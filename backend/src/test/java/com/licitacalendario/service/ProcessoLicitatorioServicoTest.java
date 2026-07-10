package com.licitacalendario.service;

import com.licitacalendario.dto.*;
import com.licitacalendario.exception.EtapaNaoEncontradaException;
import com.licitacalendario.exception.ProcessoNaoEncontradoException;
import com.licitacalendario.exception.ValidationException;
import com.licitacalendario.model.*;
import com.licitacalendario.repository.AnotacaoRepositorio;
import com.licitacalendario.repository.EtapaProcessoRepositorio;
import com.licitacalendario.repository.ProcessoLicitatorioRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcessoLicitatorioServicoTest {

    @Mock private ProcessoLicitatorioRepositorio processoRepositorio;
    @Mock private EtapaProcessoRepositorio etapaRepositorio;
    @Mock private AnotacaoRepositorio anotacaoRepositorio;
    @Mock private AuditoriaServico auditoriaServico;
    @Mock private jakarta.persistence.EntityManager entityManager;
    @Mock private org.springframework.transaction.PlatformTransactionManager transactionManager;

    private final DiasUteisServico diasUteisServico = new DiasUteisServico();
    private ProcessoLicitatorioServico servico;

    private ProcessoLicitatorioDTO dtoValido;

    @BeforeEach
    void setUp() {
        servico = new ProcessoLicitatorioServico(processoRepositorio, etapaRepositorio, anotacaoRepositorio, diasUteisServico, auditoriaServico, entityManager, transactionManager);

        dtoValido = new ProcessoLicitatorioDTO();
        dtoValido.setCliente("Prefeitura Municipal de Exemplo");
        dtoValido.setNumeroProcesso("PE 045/2026");
        dtoValido.setObjeto("Aquisição de equipamentos de informática");
        dtoValido.setDataAbertura(LocalDateTime.of(2026, 8, 18, 9, 0));
        dtoValido.setDiasUteisDocumentacao(5);
    }

    private ProcessoLicitatorio processoSalvo(Long id) {
        ProcessoLicitatorio p = new ProcessoLicitatorio();
        p.setId(id);
        p.setCliente(dtoValido.getCliente());
        p.setNumeroProcesso(dtoValido.getNumeroProcesso());
        p.setDataAbertura(dtoValido.getDataAbertura());
        p.setDiasUteisDocumentacao(dtoValido.getDiasUteisDocumentacao());
        return p;
    }

    @Test
    @DisplayName("deve gerar as 9 etapas padrão do quadro ao criar um processo")
    void deveCriarProcessoEGerarEtapasPadrao() {
        when(processoRepositorio.save(any())).thenReturn(processoSalvo(1L));
        when(processoRepositorio.buscarComAberturaNoMesmoDia(any(), any(), anyLong())).thenReturn(List.of());

        ArgumentCaptor<List<EtapaProcesso>> captor = ArgumentCaptor.forClass(List.class);
        servico.criar(dtoValido);

        verify(etapaRepositorio).saveAll(captor.capture());
        List<EtapaProcesso> etapas = captor.getValue();
        assertThat(etapas).hasSize(9);
        assertThat(etapas).extracting(EtapaProcesso::getTipo).containsExactlyInAnyOrder(TipoEtapa.values());
    }

    @Test
    @DisplayName("PREPARAR_DOCUMENTACAO respeita os dias úteis configurados no processo")
    void deveCalcularPreparaDocumentacaoComDiasUteisConfigurados() {
        when(processoRepositorio.save(any())).thenReturn(processoSalvo(1L));
        when(processoRepositorio.buscarComAberturaNoMesmoDia(any(), any(), anyLong())).thenReturn(List.of());
        ArgumentCaptor<List<EtapaProcesso>> captor = ArgumentCaptor.forClass(List.class);

        servico.criar(dtoValido);
        verify(etapaRepositorio).saveAll(captor.capture());

        EtapaProcesso doc = captor.getValue().stream().filter(e -> e.getTipo() == TipoEtapa.PREPARAR_DOCUMENTACAO).findFirst().orElseThrow();
        LocalDateTime esperado = diasUteisServico.subtrairDiasUteis(dtoValido.getDataAbertura(), 5);
        assertThat(doc.getDataPrevista()).isEqualTo(esperado);
    }

    @Test
    @DisplayName("PEDIDO_ESCLARECIMENTO_IMPUGNACAO é sempre 3 dias úteis antes, independente da configuração de documentação")
    void devePedidoEsclarecimentoSempreTresDiasUteisAntes() {
        dtoValido.setDiasUteisDocumentacao(10);
        when(processoRepositorio.save(any())).thenReturn(processoSalvo(1L));
        when(processoRepositorio.buscarComAberturaNoMesmoDia(any(), any(), anyLong())).thenReturn(List.of());
        ArgumentCaptor<List<EtapaProcesso>> captor = ArgumentCaptor.forClass(List.class);

        servico.criar(dtoValido);
        verify(etapaRepositorio).saveAll(captor.capture());

        EtapaProcesso esclarecimento = captor.getValue().stream()
                .filter(e -> e.getTipo() == TipoEtapa.PEDIDO_ESCLARECIMENTO_IMPUGNACAO).findFirst().orElseThrow();
        LocalDateTime esperado = diasUteisServico.subtrairDiasUteis(dtoValido.getDataAbertura(), 3);
        assertThat(esclarecimento.getDataPrevista()).isEqualTo(esperado);
    }

    @Test
    @DisplayName("PROPOSTA_AJUSTADA_RECURSO nasce sem data prevista e aguardando convocação")
    void devePropostaAjustadaRecursoSemDataEAguardandoConvocacao() {
        when(processoRepositorio.save(any())).thenReturn(processoSalvo(1L));
        when(processoRepositorio.buscarComAberturaNoMesmoDia(any(), any(), anyLong())).thenReturn(List.of());
        ArgumentCaptor<List<EtapaProcesso>> captor = ArgumentCaptor.forClass(List.class);

        servico.criar(dtoValido);
        verify(etapaRepositorio).saveAll(captor.capture());

        EtapaProcesso recurso = captor.getValue().stream()
                .filter(e -> e.getTipo() == TipoEtapa.PROPOSTA_AJUSTADA_RECURSO).findFirst().orElseThrow();
        assertThat(recurso.getDataPrevista()).isNull();
        assertThat(recurso.isAguardandoConvocacao()).isTrue();
    }

    @Test
    @DisplayName("DATA_ABERTURA_SESSAO e SESSAO_LANCES_CHAT coincidem com a data de abertura")
    void deveAberturaESessaoCoincidiremComDataAbertura() {
        when(processoRepositorio.save(any())).thenReturn(processoSalvo(1L));
        when(processoRepositorio.buscarComAberturaNoMesmoDia(any(), any(), anyLong())).thenReturn(List.of());
        ArgumentCaptor<List<EtapaProcesso>> captor = ArgumentCaptor.forClass(List.class);

        servico.criar(dtoValido);
        verify(etapaRepositorio).saveAll(captor.capture());

        captor.getValue().stream()
                .filter(e -> e.getTipo() == TipoEtapa.DATA_ABERTURA_SESSAO || e.getTipo() == TipoEtapa.SESSAO_LANCES_CHAT)
                .forEach(e -> assertThat(e.getDataPrevista()).isEqualTo(dtoValido.getDataAbertura()));
    }

    @Test
    @DisplayName("deve lançar ValidationException quando cliente está vazio")
    void deveLancarExcecaoSemCliente() {
        dtoValido.setCliente("");
        assertThatThrownBy(() -> servico.criar(dtoValido)).isInstanceOf(ValidationException.class);
    }

    @Test
    @DisplayName("deve lançar ValidationException quando número do processo está vazio")
    void deveLancarExcecaoSemNumeroProcesso() {
        dtoValido.setNumeroProcesso("");
        assertThatThrownBy(() -> servico.criar(dtoValido)).isInstanceOf(ValidationException.class);
    }

    @Test
    @DisplayName("deve lançar ValidationException quando data de abertura é nula")
    void deveLancarExcecaoSemDataAbertura() {
        dtoValido.setDataAbertura(null);
        assertThatThrownBy(() -> servico.criar(dtoValido)).isInstanceOf(ValidationException.class);
    }

    @Test
    @DisplayName("deve concluir etapa e registrar data de conclusão")
    void deveConcluirEtapa() {
        EtapaProcesso etapa = etapaComProcesso(1L, TipoEtapa.CADASTRO_SISTEMA);
        when(etapaRepositorio.findById(1L)).thenReturn(Optional.of(etapa));
        when(etapaRepositorio.save(any())).thenReturn(etapa);

        EtapaProcessoDTO resultado = servico.concluirEtapa(1L, true);

        assertThat(resultado.isConcluida()).isTrue();
        assertThat(resultado.getConcluidaEm()).isNotNull();
    }

    @Test
    @DisplayName("deve reabrir etapa quando concluida=false")
    void deveReabrirEtapa() {
        EtapaProcesso etapa = etapaComProcesso(1L, TipoEtapa.CADASTRO_SISTEMA);
        etapa.concluir();
        when(etapaRepositorio.findById(1L)).thenReturn(Optional.of(etapa));
        when(etapaRepositorio.save(any())).thenReturn(etapa);

        EtapaProcessoDTO resultado = servico.concluirEtapa(1L, false);

        assertThat(resultado.isConcluida()).isFalse();
        assertThat(resultado.getConcluidaEm()).isNull();
    }

    @Test
    @DisplayName("deve lançar EtapaNaoEncontradaException ao concluir etapa inexistente")
    void deveLancarExcecaoAoConcluirEtapaInexistente() {
        when(etapaRepositorio.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> servico.concluirEtapa(999L, true)).isInstanceOf(EtapaNaoEncontradaException.class);
    }

    @Test
    @DisplayName("deve reagendar etapa (ex.: recurso administrativo após convocação do pregoeiro)")
    void deveReagendarEtapa() {
        EtapaProcesso etapa = etapaComProcesso(1L, TipoEtapa.PROPOSTA_AJUSTADA_RECURSO);
        etapa.setAguardandoConvocacao(true);
        when(etapaRepositorio.findById(1L)).thenReturn(Optional.of(etapa));
        when(etapaRepositorio.save(any())).thenReturn(etapa);
        LocalDateTime novaData = LocalDateTime.of(2026, 8, 25, 15, 0);

        EtapaProcessoDTO resultado = servico.reagendarEtapa(1L, novaData);

        assertThat(resultado.getDataPrevista()).isEqualTo(novaData);
        assertThat(resultado.isAguardandoConvocacao()).isFalse();
    }

    @Test
    @DisplayName("deve lançar ValidationException ao reagendar sem nova data")
    void deveLancarExcecaoAoReagendarSemData() {
        assertThatThrownBy(() -> servico.reagendarEtapa(1L, null)).isInstanceOf(ValidationException.class);
    }

    @Test
    @DisplayName("deve adicionar anotação a uma etapa")
    void deveAdicionarAnotacao() {
        EtapaProcesso etapa = etapaComProcesso(1L, TipoEtapa.CADASTRO_SISTEMA);
        when(etapaRepositorio.findById(1L)).thenReturn(Optional.of(etapa));
        Anotacao salva = new Anotacao();
        salva.setEtapa(etapa);
        salva.setAutor("Ana");
        salva.setTexto("Aguardando retorno do órgão");
        when(anotacaoRepositorio.save(any())).thenReturn(salva);

        AnotacaoDTO dto = new AnotacaoDTO();
        dto.setAutor("Ana");
        dto.setTexto("Aguardando retorno do órgão");

        AnotacaoDTO resultado = servico.adicionarAnotacao(1L, dto);

        assertThat(resultado.getAutor()).isEqualTo("Ana");
        assertThat(resultado.getTexto()).isEqualTo("Aguardando retorno do órgão");
    }

    @Test
    @DisplayName("deve lançar ValidationException ao adicionar anotação sem texto")
    void deveLancarExcecaoAnotacaoSemTexto() {
        AnotacaoDTO dto = new AnotacaoDTO();
        dto.setAutor("Ana");
        dto.setTexto("  ");
        assertThatThrownBy(() -> servico.adicionarAnotacao(1L, dto)).isInstanceOf(ValidationException.class);
    }

    @Test
    @DisplayName("deve favoritar processo")
    void deveFavoritarProcesso() {
        ProcessoLicitatorio processo = processoSalvo(1L);
        when(processoRepositorio.findById(1L)).thenReturn(Optional.of(processo));
        when(processoRepositorio.save(any())).thenReturn(processo);
        when(etapaRepositorio.findByProcessoIdOrderByDataPrevistaAsc(1L)).thenReturn(List.of());
        when(processoRepositorio.buscarComAberturaNoMesmoDia(any(), any(), anyLong())).thenReturn(List.of());

        ProcessoComEtapasDTO resultado = servico.favoritar(1L, true);

        assertThat(resultado.isFavorito()).isTrue();
    }

    @Test
    @DisplayName("deve finalizar processo")
    void deveFinalizarProcesso() {
        ProcessoLicitatorio processo = processoSalvo(1L);
        when(processoRepositorio.findById(1L)).thenReturn(Optional.of(processo));
        when(processoRepositorio.save(any())).thenReturn(processo);
        when(etapaRepositorio.findByProcessoIdOrderByDataPrevistaAsc(1L)).thenReturn(List.of());
        when(processoRepositorio.buscarComAberturaNoMesmoDia(any(), any(), anyLong())).thenReturn(List.of());

        ProcessoComEtapasDTO resultado = servico.finalizar(1L);

        assertThat(resultado.getStatus()).isEqualTo(StatusProcesso.FINALIZADO);
    }

    @Test
    @DisplayName("deve excluir processo e suas etapas")
    void deveExcluirProcessoEEtapas() {
        when(processoRepositorio.findById(1L)).thenReturn(Optional.of(processoSalvo(1L)));

        servico.excluir(1L);

        var ordem = inOrder(anotacaoRepositorio, etapaRepositorio, processoRepositorio);
        ordem.verify(anotacaoRepositorio).deleteByEtapaProcessoId(1L);
        ordem.verify(etapaRepositorio).deleteByProcessoId(1L);
        ordem.verify(processoRepositorio).deleteById(1L);
    }

    @Test
    @DisplayName("deve lançar ProcessoNaoEncontradoException ao buscar processo inexistente")
    void deveLancarExcecaoAoBuscarProcessoInexistente() {
        when(processoRepositorio.findById(999L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> servico.buscarPorId(999L)).isInstanceOf(ProcessoNaoEncontradoException.class);
    }

    @Test
    @DisplayName("filtro CONCLUIDAS retorna apenas etapas concluídas")
    void deveFiltrarEtapasConcluidas() {
        ProcessoLicitatorio processo = processoSalvo(1L);
        EtapaProcesso concluida = etapaComProcesso(1L, TipoEtapa.CADASTRO_SISTEMA);
        concluida.setProcesso(processo);
        concluida.concluir();
        EtapaProcesso pendente = etapaComProcesso(2L, TipoEtapa.PREPARAR_DOCUMENTACAO);
        pendente.setProcesso(processo);

        when(processoRepositorio.findById(1L)).thenReturn(Optional.of(processo));
        when(etapaRepositorio.findByProcessoIdOrderByDataPrevistaAsc(1L)).thenReturn(List.of(concluida, pendente));

        List<EtapaProcessoDTO> resultado = servico.listarEtapas(1L, FiltroEtapa.CONCLUIDAS);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("filtro ATRASADAS retorna apenas etapas com prazo vencido e não concluídas")
    void deveFiltrarEtapasAtrasadas() {
        ProcessoLicitatorio processo = processoSalvo(1L);
        EtapaProcesso atrasada = etapaComProcesso(1L, TipoEtapa.PREPARAR_DOCUMENTACAO);
        atrasada.setProcesso(processo);
        atrasada.setDataPrevista(LocalDateTime.now().minusDays(2));
        EtapaProcesso futura = etapaComProcesso(2L, TipoEtapa.DATA_ABERTURA_SESSAO);
        futura.setProcesso(processo);
        futura.setDataPrevista(LocalDateTime.now().plusDays(10));

        when(processoRepositorio.findById(1L)).thenReturn(Optional.of(processo));
        when(etapaRepositorio.findByProcessoIdOrderByDataPrevistaAsc(1L)).thenReturn(List.of(atrasada, futura));

        List<EtapaProcessoDTO> resultado = servico.listarEtapas(1L, FiltroEtapa.ATRASADAS);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("resumo() conta corretamente gerenciadas, favoritas, andamento, finalizadas e tarefas pendentes")
    void deveCalcularResumoCorretamente() {
        ProcessoLicitatorio ativo = processoSalvo(1L);
        ativo.setFavorito(true);
        ProcessoLicitatorio finalizado = processoSalvo(2L);
        finalizado.setStatus(StatusProcesso.FINALIZADO);
        when(processoRepositorio.findAll()).thenReturn(List.of(ativo, finalizado));

        EtapaProcesso pendente = etapaComProcesso(10L, TipoEtapa.CADASTRO_SISTEMA);
        EtapaProcesso concluida = etapaComProcesso(11L, TipoEtapa.RESUMO_EDITAL);
        concluida.concluir();
        when(etapaRepositorio.buscarTodasOrdenadas()).thenReturn(List.of(pendente, concluida));

        ResumoProcessosDTO resumo = servico.resumo();

        assertThat(resumo.getTotalGerenciadas()).isEqualTo(2);
        assertThat(resumo.getTotalFavoritas()).isEqualTo(1);
        assertThat(resumo.getTotalAndamento()).isEqualTo(1);
        assertThat(resumo.getTotalFinalizadas()).isEqualTo(1);
        assertThat(resumo.getTotalTarefasPendentes()).isEqualTo(1);
    }

    @Test
    @DisplayName("deve retornar avisos quando outro processo ativo abre no mesmo dia")
    void deveRetornarAvisoDeMesmoDia() {
        ProcessoLicitatorio outro = processoSalvo(2L);
        outro.setNumeroProcesso("PE 099/2026");
        outro.setCliente("Outro Órgão");

        when(processoRepositorio.save(any())).thenReturn(processoSalvo(1L));
        when(processoRepositorio.buscarComAberturaNoMesmoDia(any(), any(), anyLong())).thenReturn(List.of(outro));

        ProcessoComEtapasDTO resultado = servico.criar(dtoValido);

        assertThat(resultado.getAvisosMesmoDia()).hasSize(1);
        assertThat(resultado.getAvisosMesmoDia().get(0)).contains("PE 099/2026");
    }

    @Test
    @DisplayName("deve sincronizar editais do M4 quando a query retornar registros válidos")
    void deveSincronizarEditaisM4ComSucesso() {
        when(transactionManager.getTransaction(any())).thenReturn(mock(org.springframework.transaction.TransactionStatus.class));

        jakarta.persistence.Query queryMock = mock(jakarta.persistence.Query.class);
        Object[] row = new Object[] {
            "Órgão Teste M4",
            "PE 123/2026",
            "Objeto Teste Sincronia",
            java.sql.Timestamp.valueOf("2026-08-20 10:00:00")
        };
        when(entityManager.createNativeQuery(anyString())).thenReturn(queryMock);
        when(queryMock.getResultList()).thenReturn(java.util.Collections.singletonList(row));

        when(processoRepositorio.existsByNumeroProcesso("PE 123/2026")).thenReturn(false);
        when(processoRepositorio.save(any())).thenReturn(processoSalvo(1L));

        int importados = servico.sincronizarM4();

        assertThat(importados).isEqualTo(1);
        verify(processoRepositorio).save(any());
    }

    private EtapaProcesso etapaComProcesso(Long id, TipoEtapa tipo) {
        EtapaProcesso etapa = new EtapaProcesso();
        etapa.setId(id);
        etapa.setTipo(tipo);
        etapa.setProcesso(processoSalvo(1L));
        return etapa;
    }
}
