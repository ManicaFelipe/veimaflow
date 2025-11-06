package com.veiman.vemaflow.repository;

import com.veiman.vemaflow.model.TarefaDependencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarefaDependenciaRepository extends JpaRepository<TarefaDependencia, Long> {
    List<TarefaDependencia> findByOrigemId(Long origemId);
    List<TarefaDependencia> findByDestinoId(Long destinoId);
    boolean existsByOrigemIdAndDestinoId(Long origemId, Long destinoId);
}
