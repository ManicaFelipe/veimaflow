package com.veiman.vemaflow.service;

import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.model.TarefaDependencia;
import com.veiman.vemaflow.repository.TarefaDependenciaRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
public class DependenciaService {

    private final TarefaDependenciaRepository depRepo;
    private final TarefaRepository tarefaRepo;

    public DependenciaService(TarefaDependenciaRepository depRepo, TarefaRepository tarefaRepo) {
        this.depRepo = depRepo;
        this.tarefaRepo = tarefaRepo;
    }

    @Transactional(readOnly = true)
    public Map<String, List<Long>> listar(Long tarefaId) {
        validarTarefa(tarefaId);
        Map<String, List<Long>> res = new HashMap<>();
        res.put("bloqueia", depRepo.findByOrigemId(tarefaId).stream().map(d -> d.getDestino().getId()).toList());
        res.put("bloqueadoPor", depRepo.findByDestinoId(tarefaId).stream().map(d -> d.getOrigem().getId()).toList());
        return res;
    }

    @Transactional
    public void adicionarDependencia(Long tarefaId, Long dependeDeId) {
        Tarefa destino = validarTarefa(tarefaId);
        Tarefa origem = validarTarefa(dependeDeId);
        if (depRepo.existsByOrigemIdAndDestinoId(origem.getId(), destino.getId())) return;
        // verificação de ciclo: se já existir caminho de 'destino' -> 'origem', adicionar 'origem' -> 'destino' criará ciclo
        if (existeCaminho(destino.getId(), origem.getId())) {
            throw new IllegalStateException("A dependência criaria um ciclo entre as tarefas " + dependeDeId + " e " + tarefaId);
        }
        TarefaDependencia d = new TarefaDependencia();
        d.setOrigem(origem);
        d.setDestino(destino);
        depRepo.save(d);
    }

    @Transactional
    public void removerDependencia(Long tarefaId, Long dependeDeId) {
        List<TarefaDependencia> deps = depRepo.findByDestinoId(tarefaId).stream()
                .filter(d -> d.getOrigem().getId().equals(dependeDeId)).toList();
        deps.forEach(depRepo::delete);
    }

    private Tarefa validarTarefa(Long id) {
        return tarefaRepo.findById(id).orElseThrow(() -> new NoSuchElementException("Tarefa não encontrada: " + id));
    }

    private boolean existeCaminho(Long origemId, Long destinoId) {
        // DFS iterativo para evitar stack overflow em grafos maiores
        java.util.Set<Long> visitados = new java.util.HashSet<>();
        java.util.Deque<Long> stack = new java.util.ArrayDeque<>();
        stack.push(origemId);
        while (!stack.isEmpty()) {
            Long atual = stack.pop();
            if (!visitados.add(atual)) continue;
            if (atual.equals(destinoId)) return true;
            List<TarefaDependencia> saidas = depRepo.findByOrigemId(atual);
            for (TarefaDependencia d : saidas) {
                Long proximo = d.getDestino() != null ? d.getDestino().getId() : null;
                if (proximo != null && !visitados.contains(proximo)) stack.push(proximo);
            }
        }
        return false;
    }
}
