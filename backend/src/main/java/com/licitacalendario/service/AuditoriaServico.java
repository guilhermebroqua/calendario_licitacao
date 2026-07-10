package com.licitacalendario.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditoriaServico {

    private static final Logger log = LoggerFactory.getLogger(AuditoriaServico.class);

    public void registrar(String acao, Long eventoId, String justificativa) {
        log.info("[AUDITORIA] acao={} eventoId={} justificativa={} timestamp={}",
                acao, eventoId, justificativa, LocalDateTime.now());
    }
}
