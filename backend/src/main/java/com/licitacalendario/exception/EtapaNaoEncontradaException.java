package com.licitacalendario.exception;

public class EtapaNaoEncontradaException extends RuntimeException {
    public EtapaNaoEncontradaException(Long id) {
        super("Etapa não encontrada com id: " + id);
    }
}
