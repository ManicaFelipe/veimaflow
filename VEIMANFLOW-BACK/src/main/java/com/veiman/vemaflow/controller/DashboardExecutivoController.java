package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.DashboardExecutivoItemDTO;
import com.veiman.vemaflow.service.DashboardExecutivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardExecutivoController {

    private final DashboardExecutivoService service;

    @GetMapping("/executivo")
    public List<DashboardExecutivoItemDTO> obterResumoExecutivo() {
        return service.obterResumoRAG();
    }
}
