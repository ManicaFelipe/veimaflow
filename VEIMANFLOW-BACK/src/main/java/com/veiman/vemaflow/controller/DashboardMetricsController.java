package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.DashboardDTO;
import com.veiman.vemaflow.service.DashboardMetricsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard/metrics")
public class DashboardMetricsController {

    private final DashboardMetricsService dashboardMetricsService;

    public DashboardMetricsController(DashboardMetricsService dashboardMetricsService) {
        this.dashboardMetricsService = dashboardMetricsService;
    }

    @GetMapping
    public ResponseEntity<DashboardDTO> obterMetricas(
            @RequestParam(required = false) Long projetoId
    ) {
        DashboardDTO dashboard = dashboardMetricsService.calcularMetricas(projetoId);
        return ResponseEntity.ok(dashboard);
    }
}
