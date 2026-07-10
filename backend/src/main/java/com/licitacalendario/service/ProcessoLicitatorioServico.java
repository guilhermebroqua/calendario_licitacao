package com.licitacalendario.service;

import com.licitacalendario.dto.*;
import com.licitacalendario.exception.EtapaNaoEncontradaException;
import com.licitacalendario.exception.ProcessoNaoEncontradoException;
import com.licitacalendario.exception.ValidationException;
import com.licitacalendario.model.*;
import com.licitacalendario.repository.AnotacaoRepositorio;
import com.licitacalendario.repository.EtapaProcessoRepositorio;
import com.licitacalendario.repository.ProcessoLicitatorioRepositorio;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.TransactionDefinition;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProcessoLicitatorioServico {

    private static final int DIAS_ESCLARECIMENTO_IMPUGNACAO = 3;
    private static final int DIAS_PROPOSTA_ANTES_ABERTURA = 1;
    private static final DateTimeFormatter FMT_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ProcessoLicitatorioRepositorio processoRepositorio;
    private final EtapaProcessoRepositorio etapaRepositorio;
    private final AnotacaoRepositorio anotacaoRepositorio;
    private final DiasUteisServico diasUteisServico;
    private final AuditoriaServico auditoriaServico;
    private final jakarta.persistence.EntityManager entityManager;
    private final PlatformTransactionManager transactionManager;

    public ProcessoLicitatorioServico(ProcessoLicitatorioRepositorio processoRepositorio,
                                       EtapaProcessoRepositorio etapaRepositorio,
                                       AnotacaoRepositorio anotacaoRepositorio,
                                       DiasUteisServico diasUteisServico,
                                       AuditoriaServico auditoriaServico,
                                       jakarta.persistence.EntityManager entityManager,
                                       PlatformTransactionManager transactionManager) {
        this.processoRepositorio = processoRepositorio;
        this.etapaRepositorio = etapaRepositorio;
        this.anotacaoRepositorio = anotacaoRepositorio;
        this.diasUteisServico = diasUteisServico;
        this.auditoriaServico = auditoriaServico;
        this.entityManager = entityManager;
        this.transactionManager = transactionManager;
    }

    public ProcessoComEtapasDTO criar(ProcessoLicitatorioDTO dto) {
        validarCampos(dto);

        ProcessoLicitatorio processo = new ProcessoLicitatorio();
        processo.setCliente(dto.getCliente());
        processo.setNumeroProcesso(dto.getNumeroProcesso());
        processo.setObjeto(dto.getObjeto());
        processo.setDataAbertura(dto.getDataAbertura());
        processo.setDiasUteisDocumentacao(dto.getDiasUteisDocumentacao() > 0 ? dto.getDiasUteisDocumentacao() : 5);
        processo.setFavorito(dto.isFavorito());

        ProcessoLicitatorio salvo = processoRepositorio.save(processo);
        List<EtapaProcesso> etapas = gerarEtapasPadrao(salvo);
        etapaRepositorio.saveAll(etapas);
        auditoriaServico.registrar("CRIAR_PROCESSO", salvo.getId(), null);

        return montarDTO(salvo, etapas, avisosMesmoDia(salvo));
    }

    public List<ProcessoComEtapasDTO> listar(StatusProcesso status, Boolean favorito) {
        List<ProcessoLicitatorio> processos = status != null
                ? processoRepositorio.findByStatus(status)
                : processoRepositorio.findAll();
        if (favorito != null) {
            processos = processos.stream().filter(p -> p.isFavorito() == favorito).collect(Collectors.toList());
        }
        return processos.stream()
                .map(p -> montarDTO(p, etapaRepositorio.findByProcessoIdOrderByDataPrevistaAsc(p.getId()), List.of()))
                .collect(Collectors.toList());
    }

    public ProcessoComEtapasDTO buscarPorId(Long id) {
        ProcessoLicitatorio processo = buscarOuFalhar(id);
        List<EtapaProcesso> etapas = etapaRepositorio.findByProcessoIdOrderByDataPrevistaAsc(id);
        return montarDTO(processo, etapas, avisosMesmoDia(processo));
    }

    public ProcessoComEtapasDTO favoritar(Long id, boolean favorito) {
        ProcessoLicitatorio processo = buscarOuFalhar(id);
        processo.setFavorito(favorito);
        processoRepositorio.save(processo);
        return buscarPorId(id);
    }

    public ProcessoComEtapasDTO finalizar(Long id) {
        ProcessoLicitatorio processo = buscarOuFalhar(id);
        processo.setStatus(StatusProcesso.FINALIZADO);
        processoRepositorio.save(processo);
        auditoriaServico.registrar("FINALIZAR_PROCESSO", id, null);
        return buscarPorId(id);
    }

    public void excluir(Long id) {
        buscarOuFalhar(id);
        anotacaoRepositorio.deleteByEtapaProcessoId(id);
        etapaRepositorio.deleteByProcessoId(id);
        processoRepositorio.deleteById(id);
        auditoriaServico.registrar("EXCLUIR_PROCESSO", id, null);
    }

    public List<EtapaProcessoDTO> listarEtapas(Long processoId, FiltroEtapa filtro) {
        buscarOuFalhar(processoId);
        List<EtapaProcesso> etapas = etapaRepositorio.findByProcessoIdOrderByDataPrevistaAsc(processoId);
        return aplicarFiltro(etapas, filtro);
    }

    public List<EtapaProcessoDTO> listarTodasEtapas(FiltroEtapa filtro) {
        return aplicarFiltro(etapaRepositorio.buscarTodasOrdenadas(), filtro);
    }

    private List<EtapaProcessoDTO> aplicarFiltro(List<EtapaProcesso> etapas, FiltroEtapa filtro) {
        FiltroEtapa f = filtro != null ? filtro : FiltroEtapa.TODAS;
        return etapas.stream()
                .filter(e -> switch (f) {
                    case TODAS -> true;
                    case HOJE -> e.isHoje();
                    case ATRASADAS -> e.isAtrasada();
                    case CONCLUIDAS -> e.isConcluida();
                })
                .map(EtapaProcessoDTO::de)
                .collect(Collectors.toList());
    }

    public EtapaProcessoDTO concluirEtapa(Long etapaId, boolean concluida) {
        EtapaProcesso etapa = buscarEtapaOuFalhar(etapaId);
        if (concluida) {
            etapa.concluir();
        } else {
            etapa.reabrir();
        }
        etapaRepositorio.save(etapa);
        auditoriaServico.registrar(concluida ? "CONCLUIR_ETAPA" : "REABRIR_ETAPA", etapaId, null);
        return EtapaProcessoDTO.de(etapa);
    }

    public EtapaProcessoDTO reagendarEtapa(Long etapaId, LocalDateTime novaData) {
        if (novaData == null) {
            throw new ValidationException("A nova data é obrigatória");
        }
        EtapaProcesso etapa = buscarEtapaOuFalhar(etapaId);
        etapa.setDataPrevista(novaData);
        etapa.setAguardandoConvocacao(false);
        etapaRepositorio.save(etapa);
        auditoriaServico.registrar("REAGENDAR_ETAPA", etapaId, null);
        return EtapaProcessoDTO.de(etapa);
    }

    public AnotacaoDTO adicionarAnotacao(Long etapaId, AnotacaoDTO dto) {
        if (dto.getAutor() == null || dto.getAutor().isBlank()) {
            throw new ValidationException("O autor da anotação é obrigatório");
        }
        if (dto.getTexto() == null || dto.getTexto().isBlank()) {
            throw new ValidationException("O texto da anotação é obrigatório");
        }
        EtapaProcesso etapa = buscarEtapaOuFalhar(etapaId);
        Anotacao anotacao = new Anotacao();
        anotacao.setEtapa(etapa);
        anotacao.setAutor(dto.getAutor());
        anotacao.setTexto(dto.getTexto());
        Anotacao salva = anotacaoRepositorio.save(anotacao);
        return AnotacaoDTO.de(salva);
    }

    public List<AnotacaoDTO> listarAnotacoes(Long etapaId) {
        buscarEtapaOuFalhar(etapaId);
        return anotacaoRepositorio.findByEtapaIdOrderByCriadoEmAsc(etapaId).stream()
                .map(AnotacaoDTO::de)
                .collect(Collectors.toList());
    }

    public ResumoProcessosDTO resumo() {
        List<ProcessoLicitatorio> todos = processoRepositorio.findAll();
        long gerenciadas = todos.size();
        long favoritas = todos.stream().filter(ProcessoLicitatorio::isFavorito).count();
        long andamento = todos.stream().filter(p -> p.getStatus() == StatusProcesso.EM_ANDAMENTO).count();
        long finalizadas = todos.stream().filter(p -> p.getStatus() == StatusProcesso.FINALIZADO).count();
        long tarefasPendentes = etapaRepositorio.buscarTodasOrdenadas().stream()
                .filter(e -> !e.isConcluida())
                .count();
        return new ResumoProcessosDTO(gerenciadas, favoritas, tarefasPendentes, andamento, finalizadas);
    }

    @SuppressWarnings("unchecked")
    private List<Object[]> buscarEditaisExternosM4() {
        TransactionTemplate template = new TransactionTemplate(transactionManager);
        template.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        try {
            return template.execute(status -> {
                String sql = "SELECT t.orgao, COALESCE(e.nome, a.titulo, 'Edital M4') as nome, t.objeto, e.data_abertura " +
                             "FROM public.mod4_analysis a " +
                             "JOIN public.mod4_tempmod1 t ON a.edital_id = t.edital_id " +
                             "LEFT JOIN public.mod1_editais e ON t.mod1_id = e.id " +
                             "WHERE a.decision = true OR a.status = 'go'";
                return (List<Object[]>) entityManager.createNativeQuery(sql).getResultList();
            });
        } catch (Exception e) {
            System.err.println("Erro ao consultar editais externos do M4: " + e.getMessage());
            return new java.util.ArrayList<>();
        }
    }

    @Transactional
    public int sincronizarM4() {
        int importados = 0;
        List<Object[]> resultados = buscarEditaisExternosM4();
        
        for (Object[] row : resultados) {
            String cliente = (String) row[0];
            String numeroProcesso = (String) row[1];
            String objeto = (String) row[2];
            LocalDateTime dataAbertura = null;
            if (row[3] != null) {
                if (row[3] instanceof java.sql.Timestamp) {
                    dataAbertura = ((java.sql.Timestamp) row[3]).toLocalDateTime();
                } else if (row[3] instanceof java.time.LocalDateTime) {
                    dataAbertura = (LocalDateTime) row[3];
                }
            }
            
            if (numeroProcesso != null && !numeroProcesso.isBlank()) {
                if (!processoRepositorio.existsByNumeroProcesso(numeroProcesso)) {
                    ProcessoLicitatorioDTO dto = new ProcessoLicitatorioDTO();
                    dto.setCliente(cliente != null ? cliente : "Órgão Não Informado");
                    dto.setNumeroProcesso(numeroProcesso);
                    dto.setObjeto(objeto != null ? objeto : "Objeto não informado");
                    dto.setDataAbertura(dataAbertura != null ? dataAbertura : LocalDateTime.now().plusDays(10));
                    dto.setDiasUteisDocumentacao(5);
                    dto.setFavorito(false);
                    
                    criar(dto);
                    importados++;
                }
            }
        }
        return importados;
    }

    private void validarCampos(ProcessoLicitatorioDTO dto) {
        if (dto.getCliente() == null || dto.getCliente().isBlank()) {
            throw new ValidationException("O cliente/órgão é obrigatório");
        }
        if (dto.getNumeroProcesso() == null || dto.getNumeroProcesso().isBlank()) {
            throw new ValidationException("O número do processo/edital é obrigatório");
        }
        if (dto.getDataAbertura() == null) {
            throw new ValidationException("A data de abertura é obrigatória");
        }
    }

    private List<EtapaProcesso> gerarEtapasPadrao(ProcessoLicitatorio processo) {
        LocalDateTime abertura = processo.getDataAbertura();
        LocalDateTime hoje = LocalDate.now().atTime(23, 59, 59);
        int diasDoc = processo.getDiasUteisDocumentacao();

        return List.of(
                novaEtapa(processo, TipoEtapa.RESUMO_EDITAL, hoje, false),
                novaEtapa(processo, TipoEtapa.CADASTRO_SISTEMA, hoje, false),
                novaEtapa(processo, TipoEtapa.PREPARAR_DOCUMENTACAO, diasUteisServico.subtrairDiasUteis(abertura, diasDoc), false),
                novaEtapa(processo, TipoEtapa.PEDIDO_ESCLARECIMENTO_IMPUGNACAO, diasUteisServico.subtrairDiasUteis(abertura, DIAS_ESCLARECIMENTO_IMPUGNACAO), false),
                novaEtapa(processo, TipoEtapa.REGISTRAR_PROPOSTA_PRECOS, diasUteisServico.subtrairDiasUteis(abertura, DIAS_PROPOSTA_ANTES_ABERTURA), false),
                novaEtapa(processo, TipoEtapa.DEFINIR_VALOR_MINIMO_LANCE, diasUteisServico.subtrairDiasUteis(abertura, DIAS_PROPOSTA_ANTES_ABERTURA), false),
                novaEtapa(processo, TipoEtapa.DATA_ABERTURA_SESSAO, abertura, false),
                novaEtapa(processo, TipoEtapa.SESSAO_LANCES_CHAT, abertura, false),
                novaEtapa(processo, TipoEtapa.PROPOSTA_AJUSTADA_RECURSO, null, true)
        );
    }

    private EtapaProcesso novaEtapa(ProcessoLicitatorio processo, TipoEtapa tipo, LocalDateTime data, boolean aguardandoConvocacao) {
        EtapaProcesso etapa = new EtapaProcesso();
        etapa.setProcesso(processo);
        etapa.setTipo(tipo);
        etapa.setDataPrevista(data);
        etapa.setAguardandoConvocacao(aguardandoConvocacao);
        return etapa;
    }

    private List<String> avisosMesmoDia(ProcessoLicitatorio processo) {
        if (processo.getDataAbertura() == null) return List.of();
        LocalDate dia = processo.getDataAbertura().toLocalDate();
        LocalDateTime inicioDia = LocalDateTime.of(dia, LocalTime.MIN);
        LocalDateTime fimDia = LocalDateTime.of(dia.plusDays(1), LocalTime.MIN);
        Long idExcluir = processo.getId() != null ? processo.getId() : -1L;
        return processoRepositorio.buscarComAberturaNoMesmoDia(inicioDia, fimDia, idExcluir).stream()
                .map(p -> String.format("%s (%s) também tem sessão em %s",
                        p.getNumeroProcesso(), p.getCliente(), p.getDataAbertura().format(FMT_DATA)))
                .collect(Collectors.toList());
    }

    private ProcessoComEtapasDTO montarDTO(ProcessoLicitatorio processo, List<EtapaProcesso> etapas, List<String> avisos) {
        List<EtapaProcessoDTO> etapasDTO = etapas.stream()
                .sorted(Comparator.comparing(EtapaProcesso::getTipo))
                .map(EtapaProcessoDTO::de)
                .collect(Collectors.toList());
        return ProcessoComEtapasDTO.de(processo, etapasDTO, avisos);
    }

    private ProcessoLicitatorio buscarOuFalhar(Long id) {
        return processoRepositorio.findById(id).orElseThrow(() -> new ProcessoNaoEncontradoException(id));
    }

    private EtapaProcesso buscarEtapaOuFalhar(Long id) {
        return etapaRepositorio.findById(id).orElseThrow(() -> new EtapaNaoEncontradaException(id));
    }
}
