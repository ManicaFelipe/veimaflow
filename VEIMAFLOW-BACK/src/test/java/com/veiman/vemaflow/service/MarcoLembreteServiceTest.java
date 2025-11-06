package com.veiman.vemaflow.service;

import com.veiman.vemaflow.model.MarcoProjeto;
import com.veiman.vemaflow.repository.MarcoProjetoRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;

public class MarcoLembreteServiceTest {
    @Test
    void listaProximosRespeitaLembrete() {
        MarcoProjetoRepository repo = Mockito.mock(MarcoProjetoRepository.class);
        MarcoLembreteService svc = new MarcoLembreteService(repo);

        MarcoProjeto m = new MarcoProjeto();
        m.setId(10L);
        m.setTitulo("Go Live");
        m.setData(LocalDate.now().plusDays(3));
        m.setLembreteDiasAntes(5);

        Mockito.when(repo.findByDataBetweenOrderByDataAsc(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(m));

        var lista = svc.listarProximos(7);
        assertEquals(1, lista.size());
        assertEquals(10L, lista.get(0).getId());
        // diasRestantes aproximado (0..lembrete)
        // não fixamos valor exato pois depende de LocalDate.now() no ambiente
    }
}
