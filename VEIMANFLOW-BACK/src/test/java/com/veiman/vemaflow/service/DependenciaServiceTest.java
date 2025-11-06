package com.veiman.vemaflow.service;

import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.model.TarefaDependencia;
import com.veiman.vemaflow.repository.TarefaDependenciaRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

public class DependenciaServiceTest {

    private TarefaDependenciaRepository depRepo;
    private TarefaRepository tarefaRepo;
    private DependenciaService service;

    @BeforeEach
    void setup() {
        depRepo = Mockito.mock(TarefaDependenciaRepository.class);
        tarefaRepo = Mockito.mock(TarefaRepository.class);
        service = new DependenciaService(depRepo, tarefaRepo);

        // tarefas 1,2,3
        when(tarefaRepo.findById(1L)).thenReturn(Optional.of(t(1)));
        when(tarefaRepo.findById(2L)).thenReturn(Optional.of(t(2)));
        when(tarefaRepo.findById(3L)).thenReturn(Optional.of(t(3)));

        // grafo: 1 -> 2, 2 -> 3
        when(depRepo.findByOrigemId(1L)).thenReturn(List.of(edge(1L, 2L)));
        when(depRepo.findByOrigemId(2L)).thenReturn(List.of(edge(2L, 3L)));
        when(depRepo.findByOrigemId(3L)).thenReturn(List.of());
        when(depRepo.existsByOrigemIdAndDestinoId(anyLong(), anyLong())).thenReturn(false);
    }

    @Test
    void adicionarDependenciaDeveRejeitarCicloIndireto() {
        // tentar adicionar 3 -> 1 (tarefa 1 depende de 3) fecha ciclo 1->2->3->1
        Assertions.assertThrows(IllegalStateException.class, () -> service.adicionarDependencia(1L, 3L));
    }

    private static Tarefa t(long id) { Tarefa t = new Tarefa(); t.setId(id); return t; }
    private static TarefaDependencia edge(long o, long d) {
        TarefaDependencia td = new TarefaDependencia();
        Tarefa to = new Tarefa(); to.setId(o);
        Tarefa tdst = new Tarefa(); tdst.setId(d);
        td.setOrigem(to); td.setDestino(tdst);
        return td;
    }
}
