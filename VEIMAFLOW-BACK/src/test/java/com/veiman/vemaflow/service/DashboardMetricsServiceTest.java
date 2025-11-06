package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.DashboardDTO;
import com.veiman.vemaflow.enums.StatusTarefa;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.model.TarefaHistoricoStatus;
import com.veiman.vemaflow.repository.TarefaHistoricoStatusRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DashboardMetricsServiceTest {

    @Mock
    private TarefaRepository tarefaRepository;

    @Mock
    private TarefaHistoricoStatusRepository historicoRepository;

    @InjectMocks
    private DashboardMetricsService dashboardMetricsService;

    private Tarefa tarefaPendente;    // NAO_INICIADO
    private Tarefa tarefaEmAndamento; // EM_ANDAMENTO
    private Tarefa tarefaConcluida;   // CONCLUIDA

    @BeforeEach
    void setup() {
        tarefaPendente = new Tarefa();
        tarefaPendente.setId(1L);
        tarefaPendente.setTitulo("Pendente");
        tarefaPendente.setStatus(StatusTarefa.NAO_INICIADO);
        tarefaPendente.setDataCriacao(LocalDate.now().minusDays(15));
        tarefaPendente.setDataFim(LocalDate.now().minusDays(1)); // vencida

        tarefaEmAndamento = new Tarefa();
        tarefaEmAndamento.setId(2L);
        tarefaEmAndamento.setTitulo("Em andamento");
        tarefaEmAndamento.setStatus(StatusTarefa.EM_ANDAMENTO);
        tarefaEnAndamento_setCriacaoHojeMinus(8);

        tarefaConcluida = new Tarefa();
        tarefaConcluida.setId(3L);
        tarefaConcluida.setTitulo("Concluída");
        tarefaConcluida.setStatus(StatusTarefa.CONCLUIDA);
        tarefaConcluida.setDataCriacao(LocalDate.now().minusDays(10));

        // Histórico para tarefa concluída:
        // EM_ANDAMENTO: criacao+3d 00:00
        // CONCLUIDA:    criacao+7d 00:00
        LocalDateTime inicioAndamento = LocalDateTime.of(tarefaConcluida.getDataCriacao().plusDays(3), LocalTime.MIDNIGHT);
        LocalDateTime conclusao = LocalDateTime.of(tarefaConcluida.getDataCriacao().plusDays(7), LocalTime.MIDNIGHT);

        TarefaHistoricoStatus hAndamento = new TarefaHistoricoStatus();
        hAndamento.setTarefa(tarefaConcluida);
        hAndamento.setStatusAnterior("NAO_INICIADO");
        hAndamento.setStatusNovo("EM_ANDAMENTO");
        hAndamento.setDataHoraMudanca(inicioAndamento);

        TarefaHistoricoStatus hConcluida = new TarefaHistoricoStatus();
        hConcluida.setTarefa(tarefaConcluida);
        hConcluida.setStatusAnterior("EM_ANDAMENTO");
        hConcluida.setStatusNovo("CONCLUIDA");
        hConcluida.setDataHoraMudanca(conclusao);

        when(tarefaRepository.findAll()).thenReturn(List.of(tarefaPendente, tarefaEmAndamento, tarefaConcluida));
        when(historicoRepository.findByTarefaIdOrderByDataHoraMudancaAsc(3L)).thenReturn(List.of(hAndamento, hConcluida));
        // Para outras tarefas, histórico vazio
        when(historicoRepository.findByTarefaIdOrderByDataHoraMudancaAsc(1L)).thenReturn(List.of());
        when(historicoRepository.findByTarefaIdOrderByDataHoraMudancaAsc(2L)).thenReturn(List.of());
    }

    private void tarefaEnAndamento_setCriacaoHojeMinus(int dias) {
        tarefaEmAndamento.setDataCriacao(LocalDate.now().minusDays(dias));
    }

    @Test
    void calcularMetricas_Geral_DevePreencherKpisBasicas() {
        DashboardDTO dto = dashboardMetricsService.calcularMetricas(null);

        assertThat(dto.getTotalTarefas()).isEqualTo(3);
        assertThat(dto.getTarefasPendentes()).isEqualTo(1);
        assertThat(dto.getTarefasEmAndamento()).isEqualTo(1);
        assertThat(dto.getTarefasConcluidas()).isEqualTo(1);
        assertThat(dto.getWip()).isEqualTo(1);
        assertThat(dto.getTarefasVencidas()).isEqualTo(1);

        // Lead time médio = 7 dias para a única concluída
        assertThat(dto.getLeadTimeMediaDias()).isEqualTo(7.0);
        // Cycle time médio = 4 dias (7 - 3)
        assertThat(dto.getCycleTimeMediaDias()).isEqualTo(4.0);
    }
}
