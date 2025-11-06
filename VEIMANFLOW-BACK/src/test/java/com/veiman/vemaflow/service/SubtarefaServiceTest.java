package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.SubtarefaDTO;
import com.veiman.vemaflow.dto.SubtarefaRequestDTO;
import com.veiman.vemaflow.model.Subtarefa;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.repository.SubtarefaRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SubtarefaServiceTest {

    @Mock
    private SubtarefaRepository subtarefaRepository;

    @Mock
    private TarefaRepository tarefaRepository;

    @InjectMocks
    private SubtarefaService subtarefaService;

    private Tarefa tarefa;
    private Subtarefa subtarefa1;
    private Subtarefa subtarefa2;

    @BeforeEach
    void setUp() {
        tarefa = new Tarefa();
        tarefa.setId(1L);
        tarefa.setNome("Tarefa pai");

        subtarefa1 = new Subtarefa();
        subtarefa1.setId(10L);
        subtarefa1.setTitulo("Subtarefa 1");
        subtarefa1.setConcluida(false);
        subtarefa1.setOrdem(1);
        subtarefa1.setTarefa(tarefa);

        subtarefa2 = new Subtarefa();
        subtarefa2.setId(11L);
        subtarefa2.setTitulo("Subtarefa 2");
        subtarefa2.setConcluida(true);
        subtarefa2.setOrdem(2);
        subtarefa2.setTarefa(tarefa);
    }

    @Test
    void deveListarSubtarefasPorTarefa() {
        when(tarefaRepository.findById(1L)).thenReturn(Optional.of(tarefa));
        when(subtarefaRepository.findByTarefaOrderByOrdemAsc(tarefa)).thenReturn(Arrays.asList(subtarefa1, subtarefa2));

        List<SubtarefaDTO> result = subtarefaService.listarPorTarefa(1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitulo()).isEqualTo("Subtarefa 1");
        assertThat(result.get(1).isConcluida()).isTrue();
        verify(subtarefaRepository).findByTarefaOrderByOrdemAsc(tarefa);
    }

    @Test
    void deveCriarSubtarefa() {
        SubtarefaRequestDTO request = new SubtarefaRequestDTO();
        request.setTitulo("Nova subtarefa");
        request.setConcluida(false);
        request.setOrdem(3);

        when(tarefaRepository.findById(1L)).thenReturn(Optional.of(tarefa));
        when(subtarefaRepository.save(any(Subtarefa.class))).thenAnswer(inv -> {
            Subtarefa s = inv.getArgument(0);
            s.setId(99L);
            return s;
        });

        SubtarefaDTO result = subtarefaService.criar(1L, request);

        assertThat(result).isNotNull();
        assertThat(result.getTitulo()).isEqualTo("Nova subtarefa");
        verify(subtarefaRepository).save(any(Subtarefa.class));
    }

    @Test
    void deveAtualizarSubtarefa() {
        SubtarefaRequestDTO request = new SubtarefaRequestDTO();
        request.setTitulo("Título atualizado");
        request.setConcluida(true);
        request.setOrdem(5);

        when(subtarefaRepository.findById(10L)).thenReturn(Optional.of(subtarefa1));
        when(subtarefaRepository.save(any(Subtarefa.class))).thenReturn(subtarefa1);

        SubtarefaDTO result = subtarefaService.atualizar(10L, request);

        assertThat(result.getTitulo()).isEqualTo("Título atualizado");
        assertThat(result.isConcluida()).isTrue();
        verify(subtarefaRepository).save(subtarefa1);
    }

    @Test
    void deveDeletarSubtarefa() {
        when(subtarefaRepository.existsById(10L)).thenReturn(true);
        doNothing().when(subtarefaRepository).deleteById(10L);

        subtarefaService.deletar(10L);

        verify(subtarefaRepository).deleteById(10L);
    }

    @Test
    void deveLancarExcecaoSeSubtarefaNaoEncontrada() {
        when(subtarefaRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> subtarefaService.atualizar(999L, new SubtarefaRequestDTO()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("não encontrada");
    }
}
