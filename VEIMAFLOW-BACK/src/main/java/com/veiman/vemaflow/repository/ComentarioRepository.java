package com.veiman.vemaflow.repository;

import com.veiman.vemaflow.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {
    List<Comentario> findByTarefaIdOrderByCriadoEmAsc(Long tarefaId);
}
