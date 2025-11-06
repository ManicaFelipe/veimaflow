package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.TarefaDTO;
import com.veiman.vemaflow.dto.TarefaRequestDTO;
import com.veiman.vemaflow.dto.TarefaStatusDTO;
import com.veiman.vemaflow.enums.PrioridadeTarefa;
import com.veiman.vemaflow.enums.StatusTarefa;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.repository.ProjetoRepository;
import com.veiman.vemaflow.repository.SubtarefaRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class TarefaService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaService.class);

    private final TarefaRepository tarefaRepository;
    private final ProjetoRepository projetoRepository;
    private final SubtarefaRepository subtarefaRepository;
    private final SlaService slaService;

    public TarefaService(TarefaRepository tarefaRepository, ProjetoRepository projetoRepository, SubtarefaRepository subtarefaRepository, SlaService slaService) {
        this.tarefaRepository = tarefaRepository;
        this.projetoRepository = projetoRepository;
        this.subtarefaRepository = subtarefaRepository;
        this.slaService = slaService;
    }

    public List<TarefaDTO> listarTodas() {
        logger.info("Listando todas as tarefas...");
        return tarefaRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public List<TarefaDTO> listarPorUsuario(Long usuarioId) {
        logger.info("Listando tarefas do usuário ID: {}", usuarioId);
        return tarefaRepository.findByUsuarioId(usuarioId).stream()
                .map(this::toDTO)
                .toList();
    }

    public TarefaDTO criar(TarefaRequestDTO dto) {
        logger.info("Criando nova tarefa para projeto ID: {}", dto.getProjetoId());

        if (!projetoRepository.existsById(dto.getProjetoId())) {
            logger.warn("Projeto não encontrado com ID: {}", dto.getProjetoId());
            throw new NoSuchElementException("Projeto não encontrado com ID: " + dto.getProjetoId());
        }

        Tarefa tarefa = new Tarefa();
        String titulo = (dto.getTitulo() == null || dto.getTitulo().isBlank()) ? "Nova tarefa" : dto.getTitulo().trim();
        tarefa.setTitulo(titulo);
        tarefa.setDescricao(dto.getDescricao() != null ? dto.getDescricao().trim() : "");
        tarefa.setPrioridade(dto.getPrioridade());
        // Status: tenta mapear do DTO se vier válido; caso contrário, usa NAO_INICIADO
        StatusTarefa status = StatusTarefa.NAO_INICIADO;
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            String s = dto.getStatus().trim().toUpperCase();
            try {
                status = StatusTarefa.valueOf(s);
            } catch (IllegalArgumentException ex) {
                logger.warn("Status de tarefa inválido recebido: '{}'. Usando NAO_INICIADO.", dto.getStatus());
            }
        }
        tarefa.setStatus(status);
        tarefa.setProjetoId(dto.getProjetoId());
        tarefa.setUsuarioId(dto.getUsuarioId());
        tarefa.setNomeUsuario(dto.getNomeUsuario());
        tarefa.setTimeUsuario(dto.getTimeUsuario());

        long totalTarefas = tarefaRepository.count();
        String codigo = String.format("%05d", totalTarefas + 1);
        tarefa.setCodigo(codigo);

        tarefa.setDataCriacao(LocalDate.now());
        tarefa.setDataAtualizacao(LocalDate.now());

        Tarefa salva = tarefaRepository.save(tarefa);
        logger.info("Tarefa criada com código: {}", codigo);

        return toDTO(salva);
    }

    public TarefaDTO buscarPorId(Long id) {
        logger.info("Buscando tarefa com ID: {}", id);
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Tarefa não encontrada com ID: {}", id);
                    return new NoSuchElementException("Tarefa não encontrada com ID: " + id);
                });
        return toDTO(tarefa);
    }

    public TarefaDTO atualizar(Long id, TarefaRequestDTO dto) {
        logger.info("Atualizando tarefa com ID: {}", id);
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Tarefa não encontrada para atualização com ID: {}", id);
                    return new NoSuchElementException("Tarefa não encontrada com ID: " + id);
                });

        if (dto.getTitulo() != null && !dto.getTitulo().isBlank()) {
            tarefa.setTitulo(dto.getTitulo().trim());
        }
        if (dto.getDescricao() != null) {
            tarefa.setDescricao(dto.getDescricao().trim());
        }
        if (dto.getPrioridade() != null) {
            tarefa.setPrioridade(dto.getPrioridade());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            try {
                tarefa.setStatus(StatusTarefa.valueOf(dto.getStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                logger.warn("Status de tarefa inválido recebido na atualização: '{}' — mantendo valor atual.", dto.getStatus());
            }
        }
        if (dto.getProjetoId() != null) {
            if (!projetoRepository.existsById(dto.getProjetoId())) {
                logger.warn("Projeto não encontrado ao atualizar tarefa. ID: {}", dto.getProjetoId());
                throw new NoSuchElementException("Projeto não encontrado com ID: " + dto.getProjetoId());
            }
            tarefa.setProjetoId(dto.getProjetoId());
        }
        if (dto.getUsuarioId() != null) {
            tarefa.setUsuarioId(dto.getUsuarioId());
        }
        if (dto.getNomeUsuario() != null) {
            tarefa.setNomeUsuario(dto.getNomeUsuario().trim());
        }
        if (dto.getTimeUsuario() != null) {
            tarefa.setTimeUsuario(dto.getTimeUsuario().trim());
        }
        tarefa.setDataAtualizacao(LocalDate.now());

        Tarefa atualizada = tarefaRepository.save(tarefa);
        logger.info("Tarefa atualizada com sucesso: {}", atualizada.getId());
        return toDTO(atualizada);
    }

    public void remover(Long id) {
        logger.info("Removendo tarefa com ID: {}", id);
        if (!tarefaRepository.existsById(id)) {
            logger.warn("Tarefa não encontrada para remoção com ID: {}", id);
            throw new NoSuchElementException("Tarefa não encontrada com ID: " + id);
        }
        tarefaRepository.deleteById(id);
        logger.info("Tarefa removida com sucesso.");
    }

    public List<TarefaDTO> filtrarPorStatus(String status) {
        logger.info("Filtrando tarefas por status: {}", status);
        StatusTarefa statusEnum = StatusTarefa.valueOf(status.toUpperCase());
        return tarefaRepository.findByStatus(statusEnum).stream()
                .map(this::toDTO)
                .toList();
    }

    public TarefaDTO atualizarStatus(Long id, TarefaStatusDTO dto) {
        logger.info("Atualizando status da tarefa ID: {}", id);
        Tarefa tarefa = tarefaRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Tarefa não encontrada para atualização de status com ID: {}", id);
                    return new NoSuchElementException("Tarefa não encontrada com ID: " + id);
                });

        String statusAnterior = tarefa.getStatus() != null ? tarefa.getStatus().name() : "NAO_INICIADO";
        StatusTarefa statusNovo = StatusTarefa.valueOf(dto.getStatus().toUpperCase());
        
        tarefa.setStatus(statusNovo);
        tarefa.setDataAtualizacao(LocalDate.now());

        Tarefa atualizada = tarefaRepository.save(tarefa);
        
        // Registrar mudança de status para SLA
        slaService.registrarMudancaStatus(atualizada, statusAnterior, statusNovo.name(), "sistema");
        
        logger.info("Status atualizado para '{}' na tarefa ID: {}", dto.getStatus(), id);
        return toDTO(atualizada);
    }

    private TarefaDTO toDTO(Tarefa tarefa) {
        TarefaDTO dto = new TarefaDTO();
        dto.setId(tarefa.getId());
        dto.setCodigo(tarefa.getCodigo());
        dto.setTitulo(tarefa.getTitulo());
        dto.setDescricao(tarefa.getDescricao());
        dto.setPrioridade(tarefa.getPrioridade());
        dto.setStatus(tarefa.getStatus());
        dto.setProjetoId(tarefa.getProjetoId());
        dto.setUsuarioId(tarefa.getUsuarioId());
        dto.setNomeUsuario(tarefa.getNomeUsuario());
        dto.setTimeUsuario(tarefa.getTimeUsuario());
        dto.setDataCriacao(tarefa.getDataCriacao());
        dto.setDataAtualizacao(tarefa.getDataAtualizacao());
        dto.setDataFim(tarefa.getDataFim());
        // progresso agregado por subtarefas (somente se houver subtarefas)
        try {
            var subs = subtarefaRepository.findByTarefaPaiIdOrderByOrdemAsc(tarefa.getId());
            if (subs != null && !subs.isEmpty()) {
                int total = subs.size();
                int concluidas = (int) subs.stream().filter(s -> s.getStatus() != null && s.getStatus().name().equals("CONCLUIDA")).count();
                int pct = (int) Math.round((concluidas * 100.0) / total);
                dto.setProgressoPercent(Math.max(0, Math.min(100, pct)));
            } else {
                dto.setProgressoPercent(0);
            }
        } catch (Exception ignored) {
            // Em caso de falha, mantém null para não quebrar respostas existentes
        }
        return dto;
    }
}
