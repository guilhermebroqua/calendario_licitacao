package com.licitacalendario.exception;

public class ProcessoNaoEncontradoException extends RuntimeException {
    public ProcessoNaoEncontradoException(Long id) {
        super("Processo licitatório não encontrado com id: " + id);
    }
}
