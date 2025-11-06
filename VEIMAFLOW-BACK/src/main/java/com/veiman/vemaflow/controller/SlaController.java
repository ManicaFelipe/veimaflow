package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.TarefaSlaDTO;
import com.veiman.vemaflow.service.SlaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tarefas")
public class SlaController {

    private final SlaService slaService;

    public SlaController(SlaService slaService) {
        this.slaService = slaService;
    }

    @GetMapping("/{id}/sla")
    public ResponseEntity<TarefaSlaDTO> obterSla(@PathVariable Long id) {
        TarefaSlaDTO sla = slaService.calcularSla(id);
        return ResponseEntity.ok(sla);
    }
}
