package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.ProjetoDTO;
import com.veiman.vemaflow.dto.ProjetoRequestDTO;
import com.veiman.vemaflow.service.ProjetoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projetos")
public class ProjetoController {

    private static final Logger logger = LoggerFactory.getLogger(ProjetoController.class);

    private final ProjetoService projetoService;

    public ProjetoController(ProjetoService projetoService) {
        this.projetoService = projetoService;
    }

    @GetMapping
    public List<ProjetoDTO> listarTodos() {
        logger.info("Requisição recebida: listar todos os projetos");
        return projetoService.listarTodos();
    }

    @GetMapping("/{id}")
    public ProjetoDTO buscarPorId(@PathVariable Long id) {
        logger.info("Requisição recebida: buscar projeto por ID {}", id);
        return projetoService.buscarPorId(id);
    }

    @PostMapping
    public ProjetoDTO criar(@RequestBody ProjetoRequestDTO dto) {
        logger.info("Requisição recebida: criar novo projeto");
        return projetoService.criar(dto);
    }

    @PutMapping("/{id}")
    public ProjetoDTO atualizar(@PathVariable Long id, @RequestBody ProjetoRequestDTO dto) {
        logger.info("Requisição recebida: atualizar projeto ID {}", id);
        return projetoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void remover(@PathVariable Long id) {
        logger.info("Requisição recebida: remover projeto ID {}", id);
        projetoService.remover(id);
    }

    @GetMapping("/status/{status}")
    public List<ProjetoDTO> filtrarPorStatus(@PathVariable String status) {
        logger.info("Requisição recebida: filtrar projetos por status '{}'", status);
        return projetoService.filtrarPorStatus(status);
    }

    @GetMapping("/{id}/tarefas/quantidade")
    public long contarTarefas(@PathVariable Long id) {
        logger.info("Requisição recebida: contar tarefas do projeto ID {}", id);
        return projetoService.contarTarefasPorProjeto(id);
    }

    @GetMapping("/{id}/usuarios")
    public List<?> listarUsuariosDoProjeto(@PathVariable Long id) {
        logger.info("Requisição recebida: listar usuários do projeto ID {}", id);
        // TODO: Implementar lógica para retornar usuários dos times do projeto
        return List.of(); // Retorna lista vazia por enquanto
    }

}
