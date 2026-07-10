package com.licitacalendario.service;

import com.licitacalendario.dto.EventoDTO;
import com.licitacalendario.exception.*;
import com.licitacalendario.model.*;
import com.licitacalendario.repository.EtapaProcessoRepositorio;
import com.licitacalendario.repository.EventoRepositorio;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.TransactionDefinition;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class EventoServico {

    private static final int DIAS_ALERTA_MINIMO = 3;

    private final EventoRepositorio repositorio;
    private final EtapaProcessoRepositorio etapaProcessoRepositorio;
    private final AuditoriaServico auditoriaServico;
    private final jakarta.persistence.EntityManager entityManager;
    private final PlatformTransactionManager transactionManager;

    public EventoServico(EventoRepositorio repositorio,
                         EtapaProcessoRepositorio etapaProcessoRepositorio,
                         AuditoriaServico auditoriaServico,
                         jakarta.persistence.EntityManager entityManager,
                         PlatformTransactionManager transactionManager) {
        this.repositorio = repositorio;
        this.etapaProcessoRepositorio = etapaProcessoRepositorio;
        this.auditoriaServico = auditoriaServico;
        this.entityManager = entityManager;
        this.transactionManager = transactionManager;
    }

    @SuppressWarnings("unchecked")
    private List<Object[]> executarQueryExterna(String sql, int ano, int mes) {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        try {
            return template.execute(status -> {
                return (List<Object[]>) entityManager.createNativeQuery(sql)
                        .setParameter(1, ano)
                        .setParameter(2, mes)
                        .getResultList();
            });
        } catch (Exception e) {
            System.err.println("Aviso: Falha ao executar query externa: " + e.getMessage());
            return new java.util.ArrayList<>();
        }
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public List<Evento> listarPorMes(int ano, int mes) {
        List<Evento> locais = repositorio.listarPorMes(ano, mes);
        List<Evento> externos = obterEventosExternos(ano, mes);
        List<Evento> etapasPendentes = obterEtapasPendentesComoEventos(ano, mes);

        List<Evento> combinados = new java.util.ArrayList<>(locais);
        combinados.addAll(externos);
        combinados.addAll(etapasPendentes);
        return combinados;
    }

    private static final long OFFSET_ID_SINTETICO_ETAPA = 3_000_000_000L;

    private List<Evento> obterEtapasPendentesComoEventos(int ano, int mes) {
        LocalDateTime inicioMes = LocalDateTime.of(ano, mes, 1, 0, 0);
        LocalDateTime fimMes = inicioMes.plusMonths(1);
        return converterEtapasPendentes(etapaProcessoRepositorio.buscarPorPeriodo(inicioMes, fimMes));
    }

    private List<Evento> obterEtapasPendentesParaAlertar(LocalDateTime agora, LocalDateTime limite) {
        return converterEtapasPendentes(etapaProcessoRepositorio.buscarPorPeriodo(agora, limite));
    }

    private List<Evento> converterEtapasPendentes(List<EtapaProcesso> etapas) {
        List<Evento> etapasComoEventos = new java.util.ArrayList<>();
        for (EtapaProcesso etapa : etapas) {
            if (etapa.isConcluida()) continue;

            ProcessoLicitatorio processo = etapa.getProcesso();
            Evento ev = new Evento();
            ev.setId(-(OFFSET_ID_SINTETICO_ETAPA + etapa.getId()));
            ev.setTitulo("Quadro - " + etapa.getTipo().getLabel() + " (" + processo.getCliente() + ")");
            ev.setDataInicio(etapa.getDataPrevista());
            ev.setDataFim(etapa.getDataPrevista().plusHours(1));
            ev.setDescricao("Etapa do processo " + processo.getNumeroProcesso()
                    + (processo.getObjeto() != null && !processo.getObjeto().isBlank() ? " — " + processo.getObjeto() : "")
                    + (etapa.isAtrasada() ? " (ATRASADA)" : ""));
            ev.setCategoria(CategoriaEvento.PRAZO);
            ev.setProcessoLicitatorio(processo.getNumeroProcesso());
            etapasComoEventos.add(ev);
        }
        return etapasComoEventos;
    }

    private List<Evento> obterEventosExternos(int ano, int mes) {
        List<Evento> externos = new java.util.ArrayList<>();
        
        try {
            String sql = "SELECT id, tipo, prazo_defesa, descricao " +
                         "FROM public.mod5_notificacao_contratual " +
                         "WHERE EXTRACT(YEAR FROM prazo_defesa) = ?1 AND EXTRACT(MONTH FROM prazo_defesa) = ?2";
            List<Object[]> rows = executarQueryExterna(sql, ano, mes);
            for (Object[] r : rows) {
                Evento ev = new Evento();
                String idStr = r[0] != null ? r[0].toString() : null;
                ev.setId(idStr != null ? -(long) Math.abs(idStr.hashCode()) : -System.nanoTime());
                String tipo = (String) r[1];
                ev.setTitulo("Jurídico M5 - Defesa de Notificação (" + (tipo != null ? tipo : "Geral") + ")");
                
                java.sql.Date sqlDate = (java.sql.Date) r[2];
                LocalDateTime dt = sqlDate.toLocalDate().atTime(9, 0);
                ev.setDataInicio(dt);
                ev.setDataFim(dt.plusHours(9));
                ev.setDescricao((String) r[3]);
                ev.setCategoria(CategoriaEvento.PRAZO);
                externos.add(ev);
            }
        } catch (Exception e) {
            System.err.println("Aviso: Mapeamento de mod5_notificacao_contratual falhou: " + e.getMessage());
        }

        try {
            String sql = "SELECT id, pregoeiro, data_sessao, decisao " +
                         "FROM public.mod5_sessao_julgamento " +
                         "WHERE EXTRACT(YEAR FROM data_sessao) = ?1 AND EXTRACT(MONTH FROM data_sessao) = ?2";
            List<Object[]> rows = executarQueryExterna(sql, ano, mes);
            for (Object[] r : rows) {
                Evento ev = new Evento();
                String idStr = r[0] != null ? r[0].toString() : null;
                ev.setId(idStr != null ? -(long) Math.abs(idStr.hashCode()) : -System.nanoTime());
                String pregoeiro = (String) r[1];
                ev.setTitulo("Jurídico M5 - Sessão de Julgamento (" + (pregoeiro != null ? pregoeiro : "Pregoeiro n/i") + ")");
                
                LocalDateTime dt = null;
                if (r[2] != null) {
                    if (r[2] instanceof java.sql.Timestamp) {
                        dt = ((java.sql.Timestamp) r[2]).toLocalDateTime();
                    } else if (r[2] instanceof LocalDateTime) {
                        dt = (LocalDateTime) r[2];
                    }
                }
                if (dt != null) {
                    ev.setDataInicio(dt);
                    ev.setDataFim(dt.plusHours(2));
                    ev.setDescricao((String) r[3]);
                    ev.setCategoria(CategoriaEvento.AUDIENCIA);
                    externos.add(ev);
                }
            }
        } catch (Exception e) {
            System.err.println("Aviso: Mapeamento de mod5_sessao_julgamento falhou: " + e.getMessage());
        }

        try {
            String sql = "SELECT id, contratante, vigencia_fim, objeto " +
                         "FROM public.mod8_contrato " +
                         "WHERE EXTRACT(YEAR FROM vigencia_fim) = ?1 AND EXTRACT(MONTH FROM vigencia_fim) = ?2";
            List<Object[]> rows = executarQueryExterna(sql, ano, mes);
            for (Object[] r : rows) {
                Evento ev = new Evento();
                String idStr = r[0] != null ? r[0].toString() : null;
                ev.setId(idStr != null ? -(long) Math.abs(idStr.hashCode()) : -System.nanoTime());
                String contratante = (String) r[1];
                ev.setTitulo("Contrato M8 - Fim de Vigência (" + (contratante != null ? contratante : "Geral") + ")");
                
                java.sql.Date sqlDate = (java.sql.Date) r[2];
                LocalDateTime dt = sqlDate.toLocalDate().atTime(9, 0);
                ev.setDataInicio(dt);
                ev.setDataFim(dt.plusHours(9));
                ev.setDescricao("Fim de vigência do contrato: " + r[3]);
                ev.setCategoria(CategoriaEvento.PRAZO);
                externos.add(ev);
            }
        } catch (Exception e) {
            System.err.println("Aviso: Mapeamento de mod8_contrato falhou: " + e.getMessage());
        }

        try {
            String sql = "SELECT id, tipo, data_vencimento " +
                         "FROM public.mod8_alerta " +
                         "WHERE EXTRACT(YEAR FROM data_vencimento) = ?1 AND EXTRACT(MONTH FROM data_vencimento) = ?2";
            List<Object[]> rows = executarQueryExterna(sql, ano, mes);
            for (Object[] r : rows) {
                Evento ev = new Evento();
                String idStr = r[0] != null ? r[0].toString() : null;
                ev.setId(idStr != null ? -(long) Math.abs(idStr.hashCode()) : -System.nanoTime());
                String tipo = (String) r[1];
                ev.setTitulo("Contrato M8 - Alerta (" + (tipo != null ? tipo : "Vencimento") + ")");
                
                java.sql.Date sqlDate = (java.sql.Date) r[2];
                LocalDateTime dt = sqlDate.toLocalDate().atTime(9, 0);
                ev.setDataInicio(dt);
                ev.setDataFim(dt.plusHours(9));
                ev.setDescricao("Alerta emitido pelo módulo de contratos");
                ev.setCategoria(CategoriaEvento.PRAZO);
                externos.add(ev);
            }
        } catch (Exception e) {
            System.err.println("Aviso: Mapeamento de mod8_alerta falhou: " + e.getMessage());
        }

        return externos;
    }

    public Evento criar(EventoDTO dto) {
        validarCamposObrigatorios(dto);
        validarIntervalo(dto.getDataInicio(), dto.getDataFim());
        if (!dto.isIgnorarConflito()) {
            verificarConflitoBloqueante(dto.getDataInicio(), dto.getDataFim(), null);
        }

        Evento evento = mapearDTO(dto, new Evento());
        Evento salvo = repositorio.save(evento);
        auditoriaServico.registrar("CRIAR", salvo.getId(), null);
        return salvo;
    }

    public Evento editar(Long id, EventoDTO dto) {
        Evento existente = repositorio.findById(id)
                .orElseThrow(() -> new EventoNaoEncontradoException(id));

        validarCamposObrigatorios(dto);
        validarIntervalo(dto.getDataInicio(), dto.getDataFim());
        if (!dto.isIgnorarConflito()) {
            verificarConflitoBloqueante(dto.getDataInicio(), dto.getDataFim(), id);
        }

        mapearDTO(dto, existente);
        Evento atualizado = repositorio.save(existente);
        auditoriaServico.registrar("EDITAR", atualizado.getId(), null);
        return atualizado;
    }

    public void excluir(Long id, String justificativa) {
        Evento evento = repositorio.findById(id)
                .orElseThrow(() -> new EventoNaoEncontradoException(id));

        if (evento.getProcessoLicitatorio() != null
                && !evento.getProcessoLicitatorio().isBlank()
                && (justificativa == null || justificativa.isBlank())) {
            throw new JustificativaObrigatoriaException();
        }

        auditoriaServico.registrar("EXCLUIR", id, justificativa);
        repositorio.deleteById(id);
    }

    public List<Evento> buscarEventosParaAlertar(int diasAntecedencia) {
        if (diasAntecedencia < DIAS_ALERTA_MINIMO) {
            return List.of();
        }
        LocalDateTime agora = LocalDateTime.now();
        LocalDateTime limite = agora.plusDays(diasAntecedencia);
        List<Evento> locais = repositorio.buscarEventosComPrazoProximo(agora, limite);
        List<Evento> etapasPendentes = obterEtapasPendentesParaAlertar(agora, limite);

        List<Evento> combinados = new java.util.ArrayList<>(locais);
        combinados.addAll(etapasPendentes);
        return combinados;
    }

    public List<Evento> verificarConflitos(EventoDTO dto) {
        if (dto.getDataFim() != null && dto.getDataInicio() != null
                && !dto.getDataFim().isAfter(dto.getDataInicio())) {
            throw new ValidationException("A hora de fim deve ser posterior à hora de início");
        }
        Long idExcluir = dto.getId() != null ? dto.getId() : -1L;
        return repositorio.buscarConflitos(dto.getDataInicio(), dto.getDataFim(), idExcluir);
    }

    private void validarCamposObrigatorios(EventoDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new ValidationException("O campo título é obrigatório");
        }
        if (dto.getDataInicio() == null) {
            throw new ValidationException("A data de início é obrigatória");
        }
        if (dto.getDataFim() == null) {
            throw new ValidationException("A data de fim é obrigatória");
        }
        if (dto.getCategoria() == null) {
            throw new ValidationException("A categoria é obrigatória");
        }
    }

    private void validarIntervalo(LocalDateTime inicio, LocalDateTime fim) {
        if (fim != null && inicio != null && !fim.isAfter(inicio)) {
            throw new ValidationException("A hora de fim deve ser posterior à hora de início");
        }
    }

    private void verificarConflitoBloqueante(LocalDateTime inicio, LocalDateTime fim, Long idExcluir) {
        Long excluir = idExcluir != null ? idExcluir : -1L;
        List<Evento> conflitos = repositorio.buscarConflitos(inicio, fim, excluir);
        if (!conflitos.isEmpty()) {
            throw new ConflictException("Conflito detectado com evento existente: \"" + conflitos.get(0).getTitulo() + "\"");
        }
    }

    private Evento mapearDTO(EventoDTO dto, Evento evento) {
        evento.setTitulo(dto.getTitulo());
        evento.setDataInicio(dto.getDataInicio());
        evento.setDataFim(dto.getDataFim());
        evento.setDescricao(dto.getDescricao());
        evento.setCategoria(dto.getCategoria());
        evento.setProcessoLicitatorio(dto.getProcessoLicitatorio());
        return evento;
    }
}
