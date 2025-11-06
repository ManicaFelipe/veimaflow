package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.MarcoDTO;
import com.veiman.vemaflow.dto.MarcoRequestDTO;
import com.veiman.vemaflow.model.MarcoProjeto;
import com.veiman.vemaflow.model.Projeto;
import com.veiman.vemaflow.repository.MarcoProjetoRepository;
import com.veiman.vemaflow.repository.ProjetoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MarcoServiceTest {

    @Mock
    private MarcoProjetoRepository marcoProjetoRepository;

    @Mock
    private ProjetoRepository projetoRepository;

    @InjectMocks
    private MarcoService marcoService;

    private Projeto projeto;
    private MarcoProjeto marco1;
    private MarcoProjeto marco2;

    @BeforeEach
    void setUp() {
        projeto = new Projeto();
        projeto.setId(5L);
        projeto.setNome("Projeto Teste");

        marco1 = new MarcoProjeto();
        marco1.setId(1L);
        marco1.setNome("Release 1.0");
        marco1.setData(LocalDate.of(2025, 12, 31));
        marco1.setResponsavel("João");
        marco1.setDiasLembrete(7);
        marco1.setProjeto(projeto);

        marco2 = new MarcoProjeto();
        marco2.setId(2L);
        marco2.setNome("Kickoff");
        marco2.setData(LocalDate.of(2025, 1, 15));
        marco2.setResponsavel("Maria");
        marco2.setDiasLembrete(3);
        marco2.setProjeto(projeto);
    }

    @Test
    void deveListarMarcosPorProjeto() {
        when(projetoRepository.findById(5L)).thenReturn(Optional.of(projeto));
        when(marcoProjetoRepository.findByProjetoOrderByDataAsc(projeto)).thenReturn(Arrays.asList(marco2, marco1));

        List<MarcoDTO> result = marcoService.listarPorProjeto(5L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getNome()).isEqualTo("Kickoff");
        assertThat(result.get(1).getNome()).isEqualTo("Release 1.0");
        verify(marcoProjetoRepository).findByProjetoOrderByDataAsc(projeto);
    }

    @Test
    void deveCriarMarco() {
        MarcoRequestDTO request = new MarcoRequestDTO();
        request.setNome("Sprint Review");
        request.setData(LocalDate.of(2025, 6, 15));
        request.setResponsavel("Pedro");
        request.setDiasLembrete(5);

        when(projetoRepository.findById(5L)).thenReturn(Optional.of(projeto));
        when(marcoProjetoRepository.save(any(MarcoProjeto.class))).thenAnswer(inv -> {
            MarcoProjeto m = inv.getArgument(0);
            m.setId(99L);
            return m;
        });

        MarcoDTO result = marcoService.criar(5L, request);

        assertThat(result).isNotNull();
        assertThat(result.getNome()).isEqualTo("Sprint Review");
        assertThat(result.getResponsavel()).isEqualTo("Pedro");
        verify(marcoProjetoRepository).save(any(MarcoProjeto.class));
    }

    @Test
    void deveAtualizarMarco() {
        MarcoRequestDTO request = new MarcoRequestDTO();
        request.setNome("Release 2.0");
        request.setData(LocalDate.of(2026, 1, 10));
        request.setResponsavel("Ana");
        request.setDiasLembrete(10);

        when(marcoProjetoRepository.findById(1L)).thenReturn(Optional.of(marco1));
        when(marcoProjetoRepository.save(any(MarcoProjeto.class))).thenReturn(marco1);

        MarcoDTO result = marcoService.atualizar(1L, request);

        assertThat(result.getNome()).isEqualTo("Release 2.0");
        assertThat(result.getResponsavel()).isEqualTo("Ana");
        verify(marcoProjetoRepository).save(marco1);
    }

    @Test
    void deveDeletarMarco() {
        when(marcoProjetoRepository.existsById(1L)).thenReturn(true);
        doNothing().when(marcoProjetoRepository).deleteById(1L);

        marcoService.deletar(1L);

        verify(marcoProjetoRepository).deleteById(1L);
    }

    @Test
    void deveLancarExcecaoSeMarcoNaoEncontrado() {
        when(marcoProjetoRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> marcoService.atualizar(999L, new MarcoRequestDTO()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("não encontrado");
    }
}
