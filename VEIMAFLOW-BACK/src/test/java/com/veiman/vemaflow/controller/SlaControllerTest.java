package com.veiman.vemaflow.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veiman.vemaflow.dto.SlaStatusDTO;
import com.veiman.vemaflow.dto.TarefaSlaDTO;
import com.veiman.vemaflow.service.SlaService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(SlaController.class)
@AutoConfigureMockMvc(addFilters = false)
class SlaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SlaService slaService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void deveRetornarSlaDaTarefa() throws Exception {
        TarefaSlaDTO dto = new TarefaSlaDTO(1L, "Implementar login", "EM_ANDAMENTO", 3600L,
                List.of(new SlaStatusDTO("NAO_INICIADO", 1800L), new SlaStatusDTO("EM_ANDAMENTO", 1800L)));
        when(slaService.calcularSla(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/tarefas/1/sla").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tarefaId").value(1))
                .andExpect(jsonPath("$.statusAtual").value("EM_ANDAMENTO"))
                .andExpect(jsonPath("$.temposPorStatus").isArray());
    }
}
