package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.SubtarefaDTO;
import com.veiman.vemaflow.dto.SubtarefaRequestDTO;
import com.veiman.vemaflow.enums.StatusTarefa;
import com.veiman.vemaflow.model.Subtarefa;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.repository.SubtarefaRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SubtarefaService {

    private final SubtarefaRepository subtarefaRepository;
    private final TarefaRepository tarefaRepository;

    public SubtarefaService(SubtarefaRepository subtarefaRepository, TarefaRepository tarefaRepository) {
        this.subtarefaRepository = subtarefaRepository;
        this.tarefaRepository = tarefaRepository;
    }

    @Transactional(readOnly = true)
    public List<SubtarefaDTO> listar(Long tarefaId) {
        validarTarefa(tarefaId);
        return subtarefaRepository.findByTarefaPaiIdOrderByOrdemAsc(tarefaId)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public SubtarefaDTO criar(Long tarefaId, SubtarefaRequestDTO dto) {
        Tarefa tarefa = validarTarefa(tarefaId);
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new IllegalArgumentException("Título da subtarefa é obrigatório");
        }
        Subtarefa s = new Subtarefa();
        s.setTarefaPai(tarefa);
        s.setTitulo(dto.getTitulo().trim());
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            try { s.setStatus(StatusTarefa.valueOf(dto.getStatus().trim().toUpperCase())); } catch (Exception ignored) {}
        }
        s.setOrdem(dto.getOrdem());
        return toDTO(subtarefaRepository.save(s));
    }

    @Transactional
    public SubtarefaDTO atualizar(Long id, SubtarefaRequestDTO dto) {
        Subtarefa s = subtarefaRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Subtarefa não encontrada: " + id));
        if (dto.getTitulo() != null) s.setTitulo(dto.getTitulo().trim());
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            try { s.setStatus(StatusTarefa.valueOf(dto.getStatus().trim().toUpperCase())); } catch (Exception ignored) {}
        }
        if (dto.getOrdem() != null) s.setOrdem(dto.getOrdem());
        return toDTO(subtarefaRepository.save(s));
    }

    @Transactional
    public void remover(Long id) {
        if (!subtarefaRepository.existsById(id)) {
            throw new NoSuchElementException("Subtarefa não encontrada: " + id);
        }
        subtarefaRepository.deleteById(id);
    }

    private Tarefa validarTarefa(Long tarefaId) {
        return tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new NoSuchElementException("Tarefa não encontrada com ID: " + tarefaId));
    }

    private SubtarefaDTO toDTO(Subtarefa s) {
        SubtarefaDTO dto = new SubtarefaDTO();
        dto.setId(s.getId());
        dto.setTarefaId(s.getTarefaPai() != null ? s.getTarefaPai().getId() : null);
        dto.setTitulo(s.getTitulo());
        dto.setStatus(s.getStatus());
        dto.setOrdem(s.getOrdem());
        return dto;
    }
}
