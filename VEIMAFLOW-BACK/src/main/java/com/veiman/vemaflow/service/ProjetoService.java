package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.ProjetoDTO;
import com.veiman.vemaflow.dto.ProjetoRequestDTO;
import com.veiman.vemaflow.model.Projeto;
import com.veiman.vemaflow.model.Time;
import com.veiman.vemaflow.repository.ProjetoRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import com.veiman.vemaflow.repository.TimeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class ProjetoService {

    private static final Logger logger = LoggerFactory.getLogger(ProjetoService.class);

    private final ProjetoRepository projetoRepository;
    private final TarefaRepository tarefaRepository;
    private final TimeRepository timeRepository;

    public ProjetoService(ProjetoRepository projetoRepository, TarefaRepository tarefaRepository, TimeRepository timeRepository) {
        this.projetoRepository = projetoRepository;
        this.tarefaRepository = tarefaRepository;
        this.timeRepository = timeRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjetoDTO> listarTodos() {
        logger.info("Listando todos os projetos...");
        return projetoRepository.findAllWithTimes().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjetoDTO buscarPorId(Long id) {
        logger.info("Buscando projeto com ID: {}", id);
        Projeto projeto = projetoRepository.findByIdWithTimes(id)
                .orElseThrow(() -> {
                    logger.warn("Projeto não encontrado com ID: {}", id);
                    return new NoSuchElementException("Projeto não encontrado com ID: " + id);
                });
        return toDTO(projeto);
    }

    public ProjetoDTO criar(ProjetoRequestDTO dto) {
        logger.info("Criando novo projeto: {}", dto.getNome());

        Projeto projeto = new Projeto();
    String nome = (dto.getNome() == null || dto.getNome().isBlank()) ? "Novo projeto" : dto.getNome().trim();
    String descricao = dto.getDescricao() == null ? "" : dto.getDescricao().trim();
    java.time.LocalDate inicio = dto.getDataInicio() != null ? dto.getDataInicio() : java.time.LocalDate.now();
    java.time.LocalDate fim = dto.getDataFim() != null ? dto.getDataFim() : inicio;
    String status = (dto.getStatus() != null && !dto.getStatus().isBlank()) ? dto.getStatus().trim() : "NOVO";

    projeto.setNome(nome);
    projeto.setDescricao(descricao);
    projeto.setDataInicio(inicio);
    projeto.setDataFim(fim);
    projeto.setStatus(status);

        // Gerar UUID sequencial de 5 dígitos
        long totalProjetos = projetoRepository.count();
        String uuid = String.format("%05d", totalProjetos + 1);
        projeto.setUuid(uuid);

        // Buscar times pelo ID (se fornecidos)
        if (dto.getTimesResponsaveisIds() != null && !dto.getTimesResponsaveisIds().isEmpty()) {
            List<Time> times = timeRepository.findAllById(dto.getTimesResponsaveisIds());
            projeto.setTimesResponsaveis(times);
        } else {
            projeto.setTimesResponsaveis(new java.util.ArrayList<>());
        }

        Projeto salvo = projetoRepository.save(projeto);
        logger.info("Projeto criado com ID: {}, UUID: {}", salvo.getId(), uuid);
        return toDTO(salvo);
    }

    public ProjetoDTO atualizar(Long id, ProjetoRequestDTO dto) {
        logger.info("Atualizando projeto com ID: {}", id);
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Projeto não encontrado para atualização com ID: {}", id);
                    return new NoSuchElementException("Projeto não encontrado com ID: " + id);
                });

        if (dto.getNome() != null && !dto.getNome().isBlank()) {
            projeto.setNome(dto.getNome().trim());
        }
        if (dto.getDescricao() != null) {
            projeto.setDescricao(dto.getDescricao().trim());
        }
        if (dto.getDataInicio() != null) {
            projeto.setDataInicio(dto.getDataInicio());
        }
        if (dto.getDataFim() != null) {
            projeto.setDataFim(dto.getDataFim());
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            projeto.setStatus(dto.getStatus().trim());
        }

        // Atualizar times apenas se fornecidos
        if (dto.getTimesResponsaveisIds() != null) {
            List<Time> times = dto.getTimesResponsaveisIds().isEmpty() 
                ? new java.util.ArrayList<>() 
                : timeRepository.findAllById(dto.getTimesResponsaveisIds());
            projeto.setTimesResponsaveis(times);
        }

        Projeto atualizado = projetoRepository.save(projeto);
        logger.info("Projeto atualizado com sucesso: {}", atualizado.getId());
        return toDTO(atualizado);
    }

    public void remover(Long id) {
        logger.info("Removendo projeto com ID: {}", id);
        if (!projetoRepository.existsById(id)) {
            logger.warn("Projeto não encontrado para remoção com ID: {}", id);
            throw new NoSuchElementException("Projeto não encontrado com ID: " + id);
        }
        projetoRepository.deleteById(id);
        logger.info("Projeto removido com sucesso.");
    }

    @Transactional(readOnly = true)
    public List<ProjetoDTO> filtrarPorStatus(String status) {
        logger.info("Filtrando projetos por status: {}", status);
        return projetoRepository.findByStatusIgnoreCase(status).stream()
                .map(this::toDTO)
                .toList();
    }

    public long contarTarefasPorProjeto(Long projetoId) {
        logger.info("Contando tarefas vinculadas ao projeto ID: {}", projetoId);
        if (!projetoRepository.existsById(projetoId)) {
            logger.warn("Projeto não encontrado para contagem de tarefas com ID: {}", projetoId);
            throw new NoSuchElementException("Projeto não encontrado com ID: " + projetoId);
        }
        long quantidade = tarefaRepository.countByProjetoId(projetoId);
        logger.info("Projeto ID {} possui {} tarefas.", projetoId, quantidade);
        return quantidade;
    }

    private ProjetoDTO toDTO(Projeto projeto) {
        List<Time> times = projeto.getTimesResponsaveis();
        List<String> nomesTimes = (times == null ? java.util.Collections.<Time>emptyList() : times).stream()
                .map(Time::getNome)
                .collect(Collectors.toList());

        return new ProjetoDTO(
                projeto.getId(),
                projeto.getUuid(),
                projeto.getNome(),
                projeto.getDescricao(),
                projeto.getStatus(),
                nomesTimes,
                projeto.getDataInicio(),
                projeto.getDataFim()
        );
    }

    public Projeto buscarProjetoEntityPorId(Long id) {
        return projetoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Projeto não encontrado com ID: " + id));
    }
}
