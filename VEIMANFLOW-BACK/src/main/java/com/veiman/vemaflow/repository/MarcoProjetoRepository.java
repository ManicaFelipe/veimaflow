package com.veiman.vemaflow.repository;

import com.veiman.vemaflow.model.MarcoProjeto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface MarcoProjetoRepository extends JpaRepository<MarcoProjeto, Long> {
    List<MarcoProjeto> findByProjetoIdOrderByDataAsc(Long projetoId);
    List<MarcoProjeto> findByDataBetweenOrderByDataAsc(LocalDate inicio, LocalDate fim);
}
