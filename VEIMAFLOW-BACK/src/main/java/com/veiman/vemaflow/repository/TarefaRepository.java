package com.veiman.vemaflow.repository;

import com.veiman.vemaflow.enums.StatusTarefa;
import com.veiman.vemaflow.model.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByStatus(StatusTarefa status);
    List<Tarefa> findByUsuarioId(Long usuarioId);
    List<Tarefa> findByProjetoId(Long projetoId);
    long countByProjetoId(Long projetoId);
}
