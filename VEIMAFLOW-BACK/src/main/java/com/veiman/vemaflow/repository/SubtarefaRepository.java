package com.veiman.vemaflow.repository;

import com.veiman.vemaflow.model.Subtarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubtarefaRepository extends JpaRepository<Subtarefa, Long> {
    List<Subtarefa> findByTarefaPaiIdOrderByOrdemAsc(Long tarefaId);
}
