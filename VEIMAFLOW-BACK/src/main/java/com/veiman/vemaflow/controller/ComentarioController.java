package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.ComentarioDTO;
import com.veiman.vemaflow.dto.ComentarioRequestDTO;
import com.veiman.vemaflow.service.ComentarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarefas/{tarefaId}/comentarios")
public class ComentarioController {

    private static final Logger logger = LoggerFactory.getLogger(ComentarioController.class);

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @GetMapping
    public List<ComentarioDTO> listar(@PathVariable Long tarefaId) {
        logger.info("Listando comentários da tarefa {}", tarefaId);
        return comentarioService.listarPorTarefa(tarefaId);
    }

    @PostMapping
    public ResponseEntity<ComentarioDTO> criar(@PathVariable Long tarefaId, @RequestBody ComentarioRequestDTO dto) {
        logger.info("Criando comentário na tarefa {}", tarefaId);
        ComentarioDTO criado = comentarioService.criar(tarefaId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }
}
