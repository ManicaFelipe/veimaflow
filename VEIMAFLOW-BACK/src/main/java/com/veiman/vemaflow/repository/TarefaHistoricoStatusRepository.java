package com.veiman.vemaflow.repository;

import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.model.TarefaHistoricoStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarefaHistoricoStatusRepository extends JpaRepository<TarefaHistoricoStatus, Long> {

    List<TarefaHistoricoStatus> findByTarefaOrderByDataHoraMudancaAsc(Tarefa tarefa);

    @Query("SELECT h FROM TarefaHistoricoStatus h WHERE h.tarefa.id = :tarefaId ORDER BY h.dataHoraMudanca ASC")
    List<TarefaHistoricoStatus> findByTarefaIdOrderByDataHoraMudancaAsc(Long tarefaId);
}
