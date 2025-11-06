package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.LembreteMarcoDTO;
import com.veiman.vemaflow.service.MarcoLembreteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/marcos/lembretes")
public class LembreteController {
    private final MarcoLembreteService service;

    public LembreteController(MarcoLembreteService service) { this.service = service; }

    @GetMapping
    public List<LembreteMarcoDTO> listar(@RequestParam(defaultValue = "14") int dias) {
        return service.listarProximos(dias);
    }
}
