package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.DashboardDTO;
import com.veiman.vemaflow.service.DashboardMetricsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(DashboardMetricsController.class)
@AutoConfigureMockMvc(addFilters = false)
class DashboardMetricsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardMetricsService dashboardMetricsService;

    @Test
    void deveRetornarMetricas() throws Exception {
        DashboardDTO dto = new DashboardDTO();
        dto.setTotalTarefas(10L);
        dto.setTarefasEmAndamento(3L);
        dto.setWip(3L);
        when(dashboardMetricsService.calcularMetricas(any())).thenReturn(dto);

        mockMvc.perform(get("/api/dashboard").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTarefas").value(10))
                .andExpect(jsonPath("$.wip").value(3));
    }
}
