package com.licitacalendario.exception;

public class EventoNaoEncontradoException extends RuntimeException {
    public EventoNaoEncontradoException(Long id) {
        super("Evento não encontrado com id: " + id);
    }
}
