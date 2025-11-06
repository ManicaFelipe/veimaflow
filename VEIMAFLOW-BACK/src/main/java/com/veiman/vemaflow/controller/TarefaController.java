package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.TarefaDTO;
import com.veiman.vemaflow.dto.TarefaRequestDTO;
import com.veiman.vemaflow.dto.TarefaStatusDTO;
import com.veiman.vemaflow.service.TarefaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private static final Logger logger = LoggerFactory.getLogger(TarefaController.class);

    private final TarefaService tarefaService;

    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    @GetMapping
    public List<TarefaDTO> listarTodas() {
        logger.info("Requisição recebida: listar todas as tarefas");
        return tarefaService.listarTodas();
    }

    @GetMapping("/{id}")
    public TarefaDTO buscarPorId(@PathVariable Long id) {
        logger.info("Requisição recebida: buscar tarefa por ID {}", id);
        return tarefaService.buscarPorId(id);
    }

    @PostMapping
    public TarefaDTO criar(@RequestBody TarefaRequestDTO dto) {
        logger.info("Requisição recebida: criar nova tarefa para projeto ID {}", dto.getProjetoId());
        return tarefaService.criar(dto);
    }

    @PutMapping("/{id}")
    public TarefaDTO atualizar(@PathVariable Long id, @RequestBody TarefaRequestDTO dto) {
        logger.info("Requisição recebida: atualizar tarefa ID {}", id);
        return tarefaService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        logger.info("Requisição recebida: remover tarefa ID {}", id);
        tarefaService.remover(id);
    }

    @GetMapping("/status/{status}")
    public List<TarefaDTO> filtrarPorStatus(@PathVariable String status) {
        logger.info("Requisição recebida: filtrar tarefas por status '{}'", status);
        return tarefaService.filtrarPorStatus(status);
    }

    @PatchMapping("/{id}/status")
    public TarefaDTO atualizarStatus(@PathVariable Long id, @RequestBody TarefaStatusDTO dto) {
        logger.info("Requisição recebida: atualizar status da tarefa ID {} para '{}'", id, dto.getStatus());
        return tarefaService.atualizarStatus(id, dto);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<TarefaDTO> listarPorUsuario(@PathVariable Long usuarioId) {
        logger.info("Requisição recebida: listar tarefas do usuário ID {}", usuarioId);
        return tarefaService.listarPorUsuario(usuarioId);
    }
}
