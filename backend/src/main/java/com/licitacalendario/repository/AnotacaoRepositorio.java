package com.licitacalendario.repository;

import com.licitacalendario.model.Anotacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnotacaoRepositorio extends JpaRepository<Anotacao, Long> {
    List<Anotacao> findByEtapaIdOrderByCriadoEmAsc(Long etapaId);

    @Modifying
    @Query("DELETE FROM Anotacao a WHERE a.etapa.processo.id = :processoId")
    void deleteByEtapaProcessoId(@Param("processoId") Long processoId);
}
