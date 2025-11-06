package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.service.DependenciaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tarefas/{tarefaId}/dependencias")
public class DependenciaController {

    private static final Logger logger = LoggerFactory.getLogger(DependenciaController.class);
    private final DependenciaService dependenciaService;

    public DependenciaController(DependenciaService dependenciaService) {
        this.dependenciaService = dependenciaService;
    }

    @GetMapping
    public Map<String, java.util.List<Long>> listar(@PathVariable Long tarefaId) {
        logger.info("Listando dependências da tarefa {}", tarefaId);
        return dependenciaService.listar(tarefaId);
    }

    @PostMapping
    public ResponseEntity<Void> adicionar(@PathVariable Long tarefaId, @RequestParam Long dependeDeId) {
        logger.info("Adicionando dependência: tarefa {} depende de {}", tarefaId, dependeDeId);
        dependenciaService.adicionarDependencia(tarefaId, dependeDeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> remover(@PathVariable Long tarefaId, @RequestParam Long dependeDeId) {
        logger.info("Removendo dependência: tarefa {} não depende mais de {}", tarefaId, dependeDeId);
        dependenciaService.removerDependencia(tarefaId, dependeDeId);
        return ResponseEntity.noContent().build();
    }
}
