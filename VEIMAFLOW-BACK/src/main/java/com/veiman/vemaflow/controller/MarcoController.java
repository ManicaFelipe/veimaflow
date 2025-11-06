package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.MarcoDTO;
import com.veiman.vemaflow.dto.MarcoRequestDTO;
import com.veiman.vemaflow.service.MarcoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MarcoController {

    private static final Logger logger = LoggerFactory.getLogger(MarcoController.class);

    private final MarcoService marcoService;

    public MarcoController(MarcoService marcoService) {
        this.marcoService = marcoService;
    }

    @GetMapping("/api/projetos/{projetoId}/marcos")
    public List<MarcoDTO> listar(@PathVariable Long projetoId) {
        logger.info("Listando marcos do projeto {}", projetoId);
        return marcoService.listarPorProjeto(projetoId);
    }

    @PostMapping("/api/projetos/{projetoId}/marcos")
    public ResponseEntity<MarcoDTO> criar(@PathVariable Long projetoId, @RequestBody MarcoRequestDTO dto) {
        logger.info("Criando marco no projeto {}", projetoId);
        return ResponseEntity.status(HttpStatus.CREATED).body(marcoService.criar(projetoId, dto));
    }

    @PutMapping("/api/marcos/{id}")
    public MarcoDTO atualizar(@PathVariable Long id, @RequestBody MarcoRequestDTO dto) {
        logger.info("Atualizando marco {}", id);
        return marcoService.atualizar(id, dto);
    }

    @DeleteMapping("/api/marcos/{id}")
    public ResponseEntity<Void> remover(@PathVariable Long id) {
        logger.info("Removendo marco {}", id);
        marcoService.remover(id);
        return ResponseEntity.noContent().build();
    }
}
