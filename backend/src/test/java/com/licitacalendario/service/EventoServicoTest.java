package com.licitacalendario.service;

import com.licitacalendario.dto.EventoDTO;
import com.licitacalendario.exception.*;
import com.licitacalendario.model.CategoriaEvento;
import com.licitacalendario.model.Evento;
import com.licitacalendario.model.EtapaProcesso;
import com.licitacalendario.model.ProcessoLicitatorio;
import com.licitacalendario.model.TipoEtapa;
import com.licitacalendario.repository.EtapaProcessoRepositorio;
import com.licitacalendario.repository.EventoRepositorio;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventoServicoTest {

    @Mock
    private EventoRepositorio repositorio;

    @Mock
    private EtapaProcessoRepositorio etapaProcessoRepositorio;

    @Mock
    private AuditoriaServico auditoriaServico;

    @Mock
    private jakarta.persistence.EntityManager entityManager;

    @Mock
    private org.springframework.transaction.PlatformTransactionManager transactionManager;

    @InjectMocks
    private EventoServico servico;

    private EventoDTO dtoValido;

    @BeforeEach
    void setUp() {
        dtoValido = new EventoDTO();
        dtoValido.setTitulo("Reunião");
        dtoValido.setDataInicio(LocalDateTime.of(2025, 7, 10, 9, 0));
        dtoValido.setDataFim(LocalDateTime.of(2025, 7, 10, 10, 0));
        dtoValido.setCategoria(CategoriaEvento.PRAZO);
    }

    @Test
    @DisplayName("CT-04: deve salvar evento quando todos os campos são válidos")
    void deveSalvarEventoComCamposValidos() {
        Evento eventoSalvo = new Evento();
        eventoSalvo.setTitulo("Reunião");
        when(repositorio.buscarConflitos(any(), any(), any())).thenReturn(List.of());
        when(repositorio.save(any())).thenReturn(eventoSalvo);

        Evento resultado = servico.criar(dtoValido);

        assertThat(resultado).isNotNull();
        verify(repositorio).save(any());
        verify(auditoriaServico).registrar(eq("CRIAR"), any(), isNull());
    }

    @Test
    @DisplayName("CT-05: deve lançar ValidationException quando título está vazio")
    void deveLancarExcecaoQuandoTituloVazio() {
        dtoValido.setTitulo("");

        assertThatThrownBy(() -> servico.criar(dtoValido))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("título é obrigatório");
    }

    @Test
    @DisplayName("CT-06: deve lançar ValidationException quando hora fim é anterior ao início")
    void deveLancarExcecaoQuandoFimAnteriorAoInicio() {
        dtoValido.setDataInicio(LocalDateTime.of(2025, 7, 10, 10, 0));
        dtoValido.setDataFim(LocalDateTime.of(2025, 7, 10, 9, 0));

        assertThatThrownBy(() -> servico.criar(dtoValido))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("posterior à hora de início");
    }

    @Test
    @DisplayName("CT-08: deve atualizar evento e registrar histórico")
    void deveEditarEventoExistente() {
        Evento existente = new Evento();
        existente.setTitulo("Título antigo");
        when(repositorio.findById(1L)).thenReturn(Optional.of(existente));
        when(repositorio.save(any())).thenReturn(existente);

        dtoValido.setTitulo("Reunião Atualizada");
        Evento resultado = servico.editar(1L, dtoValido);

        assertThat(resultado.getTitulo()).isEqualTo("Reunião Atualizada");
        verify(auditoriaServico).registrar(eq("EDITAR"), any(), isNull());
    }

    @Test
    @DisplayName("CT-10: deve excluir evento e registrar log de auditoria")
    void deveExcluirEventoERegistrarLog() {
        Evento evento = new Evento();
        evento.setProcessoLicitatorio(null);
        when(repositorio.findById(1L)).thenReturn(Optional.of(evento));

        servico.excluir(1L, null);

        verify(repositorio).deleteById(1L);
        verify(auditoriaServico).registrar(eq("EXCLUIR"), eq(1L), isNull());
    }

    @Test
    @DisplayName("CT-11: deve exigir justificativa ao excluir evento vinculado a processo ativo")
    void deveExigirJustificativaParaExclusaoDeProcessoAtivo() {
        Evento evento = new Evento();
        evento.setProcessoLicitatorio("PE 045/2025");
        when(repositorio.findById(1L)).thenReturn(Optional.of(evento));

        assertThatThrownBy(() -> servico.excluir(1L, ""))
                .isInstanceOf(JustificativaObrigatoriaException.class);
    }

    @Test
    @DisplayName("CT-12: deve retornar eventos para alertas quando prazo em 7 dias")
    void deveRetornarEventosParaAlertar() {
        Evento evento = new Evento();
        when(repositorio.buscarEventosComPrazoProximo(any(), any())).thenReturn(List.of(evento));

        List<Evento> resultado = servico.buscarEventosParaAlertar(7);

        assertThat(resultado).hasSize(1);
    }

    @Test
    @DisplayName("CT-13: deve disparar alerta quando prazo é exatamente 3 dias")
    void deveDispararAlertaComPrazoExatamenteEmTresDias() {
        Evento evento = new Evento();
        when(repositorio.buscarEventosComPrazoProximo(any(), any())).thenReturn(List.of(evento));

        List<Evento> resultado = servico.buscarEventosParaAlertar(3);

        assertThat(resultado).hasSize(1);
    }

    @Test
    @DisplayName("CT-14: não deve gerar novo alerta quando prazo é inferior a 3 dias")
    void naoDeveGerarAlertaComPrazoAbaixoDoMinimo() {
        List<Evento> resultado = servico.buscarEventosParaAlertar(2);

        assertThat(resultado).isEmpty();
        verifyNoInteractions(repositorio);
        verifyNoInteractions(etapaProcessoRepositorio);
    }

    @Test
    @DisplayName("deve incluir etapa pendente do Quadro na Central de Alertas")
    void deveIncluirEtapaPendenteDoQuadroNosAlertas() {
        when(repositorio.buscarEventosComPrazoProximo(any(), any())).thenReturn(List.of());

        ProcessoLicitatorio processo = new ProcessoLicitatorio();
        processo.setCliente("Prefeitura de Bagé");
        processo.setNumeroProcesso("PE 045/2026");

        EtapaProcesso etapa = new EtapaProcesso();
        etapa.setId(20L);
        etapa.setProcesso(processo);
        etapa.setTipo(TipoEtapa.PEDIDO_ESCLARECIMENTO_IMPUGNACAO);
        etapa.setDataPrevista(LocalDateTime.now().plusDays(2));

        when(etapaProcessoRepositorio.buscarPorPeriodo(any(), any())).thenReturn(List.of(etapa));

        List<Evento> resultado = servico.buscarEventosParaAlertar(7);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getTitulo()).contains("Pedido de esclarecimentos ou impugnação");
        assertThat(resultado.get(0).getProcessoLicitatorio()).isEqualTo("PE 045/2026");
    }

    @Test
    @DisplayName("não deve incluir etapa do Quadro já concluída na Central de Alertas")
    void naoDeveIncluirEtapaConcluidaDoQuadroNosAlertas() {
        when(repositorio.buscarEventosComPrazoProximo(any(), any())).thenReturn(List.of());

        ProcessoLicitatorio processo = new ProcessoLicitatorio();
        processo.setCliente("Prefeitura de Bagé");
        processo.setNumeroProcesso("PE 045/2026");

        EtapaProcesso etapaConcluida = new EtapaProcesso();
        etapaConcluida.setId(21L);
        etapaConcluida.setProcesso(processo);
        etapaConcluida.setTipo(TipoEtapa.PEDIDO_ESCLARECIMENTO_IMPUGNACAO);
        etapaConcluida.setDataPrevista(LocalDateTime.now().plusDays(2));
        etapaConcluida.concluir();

        when(etapaProcessoRepositorio.buscarPorPeriodo(any(), any())).thenReturn(List.of(etapaConcluida));

        List<Evento> resultado = servico.buscarEventosParaAlertar(7);

        assertThat(resultado).isEmpty();
    }

    @Test
    @DisplayName("CT-15: deve lançar ConflictException ao detectar conflito de datas")
    void deveLancarConflictExceptionComDatasConflitantes() {
        Evento conflitante = new Evento();
        conflitante.setTitulo("Sessão pública existente");
        when(repositorio.buscarConflitos(any(), any(), any())).thenReturn(List.of(conflitante));

        assertThatThrownBy(() -> servico.criar(dtoValido))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Conflito detectado");
    }

    @Test
    @DisplayName("CT-16: deve salvar evento normalmente quando não há conflito de datas")
    void deveSalvarEventoSemConflito() {
        when(repositorio.buscarConflitos(any(), any(), any())).thenReturn(List.of());
        when(repositorio.save(any())).thenReturn(new Evento());

        assertThatCode(() -> servico.criar(dtoValido)).doesNotThrowAnyException();
    }

    @Test
    @DisplayName("CT-09: deve lançar EventoNaoEncontradoException ao editar id inexistente")
    void deveLancarExcecaoAoEditarEventoInexistente() {
        when(repositorio.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servico.editar(999L, dtoValido))
                .isInstanceOf(EventoNaoEncontradoException.class);
    }

    @Test
    @DisplayName("CT-17: deve lançar ConflictException ao editar evento para horário conflitante")
    void deveLancarConflictExceptionAoEditarComConflito() {
        Evento existente = new Evento();
        Evento conflitante = new Evento();
        conflitante.setTitulo("Audiência já marcada");
        when(repositorio.findById(1L)).thenReturn(Optional.of(existente));
        when(repositorio.buscarConflitos(any(), any(), eq(1L))).thenReturn(List.of(conflitante));

        assertThatThrownBy(() -> servico.editar(1L, dtoValido))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Conflito detectado");
    }

    @Test
    @DisplayName("deve salvar mesmo com conflito quando ignorarConflito=true")
    void deveSalvarComConflitoQuandoIgnorarConflitoAtivo() {
        dtoValido.setIgnorarConflito(true);
        when(repositorio.save(any())).thenReturn(new Evento());

        assertThatCode(() -> servico.criar(dtoValido)).doesNotThrowAnyException();
        verify(repositorio, never()).buscarConflitos(any(), any(), any());
    }

    @Test
    @DisplayName("deve integrar eventos do M5 e M8 dinamicamente")
    void deveListarPorMesIntegrandoM5eM8() {
        when(transactionManager.getTransaction(any())).thenReturn(mock(org.springframework.transaction.TransactionStatus.class));
        when(repositorio.listarPorMes(2026, 7)).thenReturn(List.of());

        jakarta.persistence.Query q1 = mock(jakarta.persistence.Query.class);
        when(q1.setParameter(anyInt(), any())).thenReturn(q1);
        Object[] rowM5Notificacao = new Object[] {
            "uuid-m5-notif",
            "tipo-teste",
            java.sql.Date.valueOf("2026-07-15"),
            "Descrição Notificação M5"
        };
        
        jakarta.persistence.Query q2 = mock(jakarta.persistence.Query.class);
        when(q2.setParameter(anyInt(), any())).thenReturn(q2);
        Object[] rowM5Sessao = new Object[] {
            "uuid-m5-sessao",
            "Pregoeiro Teste",
            java.sql.Timestamp.valueOf("2026-07-22 14:00:00"),
            "Decisão Sessão M5"
        };

        jakarta.persistence.Query q3 = mock(jakarta.persistence.Query.class);
        when(q3.setParameter(anyInt(), any())).thenReturn(q3);
        Object[] rowM8Contrato = new Object[] {
            "uuid-m8-contrato",
            "Contratante Teste",
            java.sql.Date.valueOf("2026-07-28"),
            "Objeto Contrato M8"
        };

        jakarta.persistence.Query q4 = mock(jakarta.persistence.Query.class);
        when(q4.setParameter(anyInt(), any())).thenReturn(q4);
        Object[] rowM8Alerta = new Object[] {
            "uuid-m8-alerta",
            "Alerta Teste",
            java.sql.Date.valueOf("2026-07-18")
        };

        when(entityManager.createNativeQuery(anyString())).thenReturn(q1, q2, q3, q4);
        when(q1.getResultList()).thenReturn(java.util.Collections.singletonList(rowM5Notificacao));
        when(q2.getResultList()).thenReturn(java.util.Collections.singletonList(rowM5Sessao));
        when(q3.getResultList()).thenReturn(java.util.Collections.singletonList(rowM8Contrato));
        when(q4.getResultList()).thenReturn(java.util.Collections.singletonList(rowM8Alerta));

        List<Evento> eventos = servico.listarPorMes(2026, 7);

        assertThat(eventos).hasSize(4);
        assertThat(eventos.get(0).getTitulo()).contains("Jurídico M5 - Defesa de Notificação");
        assertThat(eventos.get(1).getTitulo()).contains("Jurídico M5 - Sessão de Julgamento");
        assertThat(eventos.get(2).getTitulo()).contains("Contrato M8 - Fim de Vigência");
        assertThat(eventos.get(3).getTitulo()).contains("Contrato M8 - Alerta");
    }

    @Test
    @DisplayName("deve incluir etapa pendente do Quadro como evento somente leitura no calendário")
    void deveListarPorMesIncluindoEtapaPendenteDoQuadro() {
        when(repositorio.listarPorMes(2026, 7)).thenReturn(List.of());

        ProcessoLicitatorio processo = new ProcessoLicitatorio();
        processo.setCliente("Prefeitura de Bagé");
        processo.setNumeroProcesso("PE 045/2026");

        EtapaProcesso etapa = new EtapaProcesso();
        etapa.setId(10L);
        etapa.setProcesso(processo);
        etapa.setTipo(TipoEtapa.PREPARAR_DOCUMENTACAO);
        etapa.setDataPrevista(LocalDateTime.of(2026, 7, 15, 9, 0));

        when(etapaProcessoRepositorio.buscarPorPeriodo(any(), any())).thenReturn(List.of(etapa));

        List<Evento> eventos = servico.listarPorMes(2026, 7);

        assertThat(eventos).hasSize(1);
        Evento sintetico = eventos.get(0);
        assertThat(sintetico.getId()).isEqualTo(-3_000_000_010L);
        assertThat(sintetico.getTitulo()).isEqualTo("Quadro - Preparar documentação (Prefeitura de Bagé)");
        assertThat(sintetico.getCategoria()).isEqualTo(CategoriaEvento.PRAZO);
        assertThat(sintetico.getProcessoLicitatorio()).isEqualTo("PE 045/2026");
        assertThat(sintetico.getDataInicio()).isEqualTo(LocalDateTime.of(2026, 7, 15, 9, 0));
    }

    @Test
    @DisplayName("não deve incluir etapa do Quadro já concluída no calendário")
    void naoDeveIncluirEtapaConcluidaDoQuadro() {
        when(repositorio.listarPorMes(2026, 7)).thenReturn(List.of());

        ProcessoLicitatorio processo = new ProcessoLicitatorio();
        processo.setCliente("Prefeitura de Bagé");
        processo.setNumeroProcesso("PE 045/2026");

        EtapaProcesso etapaConcluida = new EtapaProcesso();
        etapaConcluida.setId(11L);
        etapaConcluida.setProcesso(processo);
        etapaConcluida.setTipo(TipoEtapa.CADASTRO_SISTEMA);
        etapaConcluida.setDataPrevista(LocalDateTime.of(2026, 7, 2, 23, 59));
        etapaConcluida.concluir();

        when(etapaProcessoRepositorio.buscarPorPeriodo(any(), any())).thenReturn(List.of(etapaConcluida));

        List<Evento> eventos = servico.listarPorMes(2026, 7);

        assertThat(eventos).isEmpty();
    }

    @Test
    @DisplayName("etapa atrasada do Quadro aparece marcada na descrição do evento sintético")
    void etapaAtrasadaDoQuadroApareceMarcadaNaDescricao() {
        when(repositorio.listarPorMes(2020, 1)).thenReturn(List.of());

        ProcessoLicitatorio processo = new ProcessoLicitatorio();
        processo.setCliente("Câmara Municipal");
        processo.setNumeroProcesso("PE 001/2020");

        EtapaProcesso etapaAtrasada = new EtapaProcesso();
        etapaAtrasada.setId(12L);
        etapaAtrasada.setProcesso(processo);
        etapaAtrasada.setTipo(TipoEtapa.DATA_ABERTURA_SESSAO);
        etapaAtrasada.setDataPrevista(LocalDateTime.of(2020, 1, 15, 9, 0));

        when(etapaProcessoRepositorio.buscarPorPeriodo(any(), any())).thenReturn(List.of(etapaAtrasada));

        List<Evento> eventos = servico.listarPorMes(2020, 1);

        assertThat(eventos).hasSize(1);
        assertThat(eventos.get(0).getDescricao()).contains("ATRASADA");
    }
}
