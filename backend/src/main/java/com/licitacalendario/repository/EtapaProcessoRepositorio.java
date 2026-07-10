package com.licitacalendario.repository;

import com.licitacalendario.model.EtapaProcesso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EtapaProcessoRepositorio extends JpaRepository<EtapaProcesso, Long> {

    List<EtapaProcesso> findByProcessoIdOrderByDataPrevistaAsc(Long processoId);

    @Query("SELECT e FROM EtapaProcesso e WHERE e.dataPrevista >= :inicio AND e.dataPrevista < :fim ORDER BY e.dataPrevista ASC")
    List<EtapaProcesso> buscarPorPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);

    @Query("SELECT e FROM EtapaProcesso e ORDER BY e.dataPrevista ASC")
    List<EtapaProcesso> buscarTodasOrdenadas();

    void deleteByProcessoId(Long processoId);
}
