package com.licitacalendario.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(ValidationException ex) {
        return ResponseEntity.badRequest().body(erro(400, ex.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(ConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erro(409, ex.getMessage()));
    }

    @ExceptionHandler(EventoNaoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleNaoEncontrado(EventoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro(404, ex.getMessage()));
    }

    @ExceptionHandler(JustificativaObrigatoriaException.class)
    public ResponseEntity<Map<String, Object>> handleJustificativa(JustificativaObrigatoriaException ex) {
        return ResponseEntity.badRequest().body(erro(400, ex.getMessage()));
    }

    @ExceptionHandler(ProcessoNaoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleProcessoNaoEncontrado(ProcessoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro(404, ex.getMessage()));
    }

    @ExceptionHandler(EtapaNaoEncontradaException.class)
    public ResponseEntity<Map<String, Object>> handleEtapaNaoEncontrada(EtapaNaoEncontradaException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro(404, ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleBeanValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(e -> e.getDefaultMessage())
                .orElse("Dados inválidos");
        return ResponseEntity.badRequest().body(erro(400, msg));
    }

    private Map<String, Object> erro(int status, String mensagem) {
        return Map.of(
                "status", status,
                "mensagem", mensagem,
                "timestamp", LocalDateTime.now().toString()
        );
    }
}
