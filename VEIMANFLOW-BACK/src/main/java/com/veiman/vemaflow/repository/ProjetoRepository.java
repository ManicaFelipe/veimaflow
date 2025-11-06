package com.veiman.vemaflow.repository;

import com.veiman.vemaflow.model.Projeto;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetoRepository extends JpaRepository<Projeto, Long> {
    List<Projeto> findByStatusIgnoreCase(String status);

    @Query("select distinct p from Projeto p left join fetch p.timesResponsaveis")
    List<Projeto> findAllWithTimes();

    @Query("select p from Projeto p left join fetch p.timesResponsaveis where p.id = :id")
    java.util.Optional<Projeto> findByIdWithTimes(@Param("id") Long id);
}

