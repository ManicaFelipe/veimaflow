package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.SubtarefaDTO;
import com.veiman.vemaflow.dto.SubtarefaRequestDTO;
import com.veiman.vemaflow.service.SubtarefaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SubtarefaController {

    private static final Logger logger = LoggerFactory.getLogger(SubtarefaController.class);

    private final SubtarefaService subtarefaService;

    public SubtarefaController(SubtarefaService subtarefaService) {
        this.subtarefaService = subtarefaService;
    }

    @GetMapping("/api/tarefas/{tarefaId}/subtarefas")
    public List<SubtarefaDTO> listar(@PathVariable Long tarefaId) {
        logger.info("Listando subtarefas da tarefa {}", tarefaId);
        return subtarefaService.listar(tarefaId);
    }

    @PostMapping("/api/tarefas/{tarefaId}/subtarefas")
    public ResponseEntity<SubtarefaDTO> criar(@PathVariable Long tarefaId, @RequestBody SubtarefaRequestDTO dto) {
        logger.info("Criando subtarefa na tarefa {}", tarefaId);
        return ResponseEntity.status(HttpStatus.CREATED).body(subtarefaService.criar(tarefaId, dto));
    }

    @PutMapping("/api/subtarefas/{id}")
    public SubtarefaDTO atualizar(@PathVariable Long id, @RequestBody SubtarefaRequestDTO dto) {
        logger.info("Atualizando subtarefa {}", id);
        return subtarefaService.atualizar(id, dto);
    }

    @DeleteMapping("/api/subtarefas/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        logger.info("Removendo subtarefa {}", id);
        subtarefaService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
