package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.TarefaSlaDTO;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.model.TarefaHistoricoStatus;
import com.veiman.vemaflow.enums.StatusTarefa;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SlaServiceTest {

    @Mock
    private TarefaRepository tarefaRepository;

    @Mock
    private TarefaHistoricoStatusRepository historicoRepository;

    @InjectMocks
    private SlaService slaService;

    private Tarefa tarefa;

    @BeforeEach
    void setup() {
        tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setTitulo("Implementar login");
        tarefa.setStatus(StatusTarefa.EM_ANDAMENTO);
        tarefa.setDataCriacao(LocalDate.now().minusDays(3));
    }

    @Test
    void calcularSla_ComHistorico_DeveRetornarTemposPorStatus() {
        // Histórico: NAO_INICIADO (da criação até t1), depois EM_ANDAMENTO (t1 até agora)
        LocalDateTime t1 = tarefa.getDataCriacao().atStartOfDay().plusDays(1);

        TarefaHistoricoStatus h1 = new TarefaHistoricoStatus();
        h1.setTarefa(tarefa);
        h1.setStatusAnterior("NAO_INICIADO");
        h1.setStatusNovo("EM_ANDAMENTO");
        h1.setDataHoraMudanca(t1);

        when(tarefaRepository.findById(1L)).thenReturn(Optional.of(tarefa));
        when(historicoRepository.findByTarefaIdOrderByDataHoraMudancaAsc(1L)).thenReturn(List.of(h1));

        TarefaSlaDTO dto = slaService.calcularSla(1L);

        assertThat(dto.getTarefaId()).isEqualTo(1L);
        assertThat(dto.getTituloTarefa()).isEqualTo("Implementar login");
        assertThat(dto.getStatusAtual()).isEqualTo("EM_ANDAMENTO");
        assertThat(dto.getTempoTotalSegundos()).isPositive();
        assertThat(dto.getTemposPorStatus())
                .extracting("status")
                .contains("NAO_INICIADO", "EM_ANDAMENTO");
        assertThat(dto.getTemposPorStatus())
                .allSatisfy(s -> assertThat(s.getTempoFormatado()).isNotNull());
    }

    @Test
    void calcularSla_SemHistorico_UsaCriacaoEAtribuiAoStatusAtual() {
        when(tarefaRepository.findById(1L)).thenReturn(Optional.of(tarefa));
        when(historicoRepository.findByTarefaIdOrderByDataHoraMudancaAsc(1L)).thenReturn(List.of());

        TarefaSlaDTO dto = slaService.calcularSla(1L);

        assertThat(dto.getTemposPorStatus()).hasSize(1);
        assertThat(dto.getTemposPorStatus().get(0).getStatus()).isEqualTo("EM_ANDAMENTO");
        assertThat(dto.getTempoTotalSegundos()).isPositive();
    }
}
