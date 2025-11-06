package com.veiman.vemaflow.repository;

import com.veiman.vemaflow.model.Time;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TimeRepository extends JpaRepository<Time, Long> {
    boolean existsByNome(String nome);
}
