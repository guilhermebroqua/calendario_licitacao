package com.licitacalendario.exception;

public class JustificativaObrigatoriaException extends RuntimeException {
    public JustificativaObrigatoriaException() {
        super("Justificativa é obrigatória para excluir evento vinculado a processo ativo");
    }
}
