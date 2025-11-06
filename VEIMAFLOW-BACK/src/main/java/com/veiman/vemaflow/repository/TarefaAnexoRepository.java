package com.veiman.vemaflow.repository;

import com.veiman.vemaflow.model.TarefaAnexo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarefaAnexoRepository extends JpaRepository<TarefaAnexo, Long> {
    List<TarefaAnexo> findByTarefaIdOrderByCriadoEmAsc(Long tarefaId);
}
