package com.licitacalendario.repository;

import com.licitacalendario.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventoRepositorio extends JpaRepository<Evento, Long> {

    @Query("SELECT e FROM Evento e WHERE YEAR(e.dataInicio) = :ano AND MONTH(e.dataInicio) = :mes")
    List<Evento> listarPorMes(@Param("ano") int ano, @Param("mes") int mes);

    @Query("SELECT e FROM Evento e WHERE e.dataInicio < :fim AND e.dataFim > :inicio AND e.id <> :idExcluir")
    List<Evento> buscarConflitos(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim,
        @Param("idExcluir") Long idExcluir
    );

    @Query("SELECT e FROM Evento e WHERE e.dataInicio BETWEEN :agora AND :limite")
    List<Evento> buscarEventosComPrazoProximo(
        @Param("agora") LocalDateTime agora,
        @Param("limite") LocalDateTime limite
    );
}
