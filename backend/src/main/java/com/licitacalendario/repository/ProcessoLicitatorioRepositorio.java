package com.licitacalendario.repository;

import com.licitacalendario.model.ProcessoLicitatorio;
import com.licitacalendario.model.StatusProcesso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProcessoLicitatorioRepositorio extends JpaRepository<ProcessoLicitatorio, Long> {

    List<ProcessoLicitatorio> findByStatus(StatusProcesso status);

    List<ProcessoLicitatorio> findByFavoritoTrue();

    boolean existsByNumeroProcesso(String numeroProcesso);

    @Query("SELECT p FROM ProcessoLicitatorio p WHERE p.id <> :idExcluir " +
           "AND p.status = com.licitacalendario.model.StatusProcesso.EM_ANDAMENTO " +
           "AND p.dataAbertura >= :inicioDia AND p.dataAbertura < :fimDia")
    List<ProcessoLicitatorio> buscarComAberturaNoMesmoDia(
        @Param("inicioDia") LocalDateTime inicioDia,
        @Param("fimDia") LocalDateTime fimDia,
        @Param("idExcluir") Long idExcluir
    );
}
