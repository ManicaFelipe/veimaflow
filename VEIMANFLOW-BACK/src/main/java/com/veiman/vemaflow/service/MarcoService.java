package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.MarcoDTO;
import com.veiman.vemaflow.dto.MarcoRequestDTO;
import com.veiman.vemaflow.model.MarcoProjeto;
import com.veiman.vemaflow.model.Projeto;
import com.veiman.vemaflow.repository.MarcoProjetoRepository;
import com.veiman.vemaflow.repository.ProjetoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class MarcoService {

    private final MarcoProjetoRepository marcoProjetoRepository;
    private final ProjetoRepository projetoRepository;

    public MarcoService(MarcoProjetoRepository marcoProjetoRepository, ProjetoRepository projetoRepository) {
        this.marcoProjetoRepository = marcoProjetoRepository;
        this.projetoRepository = projetoRepository;
    }

    @Transactional(readOnly = true)
    public List<MarcoDTO> listarPorProjeto(Long projetoId) {
        // Validar existência do projeto
        projetoRepository.findById(projetoId)
                .orElseThrow(() -> new NoSuchElementException("Projeto não encontrado com ID: " + projetoId));

        return marcoProjetoRepository.findByProjetoIdOrderByDataAsc(projetoId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public MarcoDTO criar(Long projetoId, MarcoRequestDTO dto) {
        validar(dto);
        Projeto projeto = projetoRepository.findById(projetoId)
                .orElseThrow(() -> new NoSuchElementException("Projeto não encontrado com ID: " + projetoId));
        MarcoProjeto m = new MarcoProjeto();
        m.setProjeto(projeto);
        m.setTitulo(dto.getTitulo().trim());
        m.setData(dto.getData());
        m.setResponsavelNome(dto.getResponsavelNome());
        m.setLembreteDiasAntes(dto.getLembreteDiasAntes());
        return toDTO(marcoProjetoRepository.save(m));
    }

    @Transactional
    public MarcoDTO atualizar(Long id, MarcoRequestDTO dto) {
        validar(dto);
        MarcoProjeto m = marcoProjetoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Marco não encontrado com ID: " + id));
        m.setTitulo(dto.getTitulo().trim());
        m.setData(dto.getData());
        m.setResponsavelNome(dto.getResponsavelNome());
        m.setLembreteDiasAntes(dto.getLembreteDiasAntes());
        return toDTO(marcoProjetoRepository.save(m));
    }

    @Transactional
    public void remover(Long id) {
        if (!marcoProjetoRepository.existsById(id)) {
            throw new NoSuchElementException("Marco não encontrado com ID: " + id);
        }
        marcoProjetoRepository.deleteById(id);
    }

    private void validar(MarcoRequestDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Dados do marco são obrigatórios");
        }
        if (dto.getTitulo() == null || dto.getTitulo().trim().isEmpty()) {
            throw new IllegalArgumentException("Título do marco é obrigatório");
        }
        if (dto.getData() == null) {
            throw new IllegalArgumentException("Data do marco é obrigatória");
        }
    }

    private MarcoDTO toDTO(MarcoProjeto m) {
        MarcoDTO dto = new MarcoDTO();
        dto.setId(m.getId());
        dto.setProjetoId(m.getProjeto() != null ? m.getProjeto().getId() : null);
        dto.setTitulo(m.getTitulo());
        dto.setData(m.getData());
        dto.setResponsavelNome(m.getResponsavelNome());
        dto.setLembreteDiasAntes(m.getLembreteDiasAntes());
        return dto;
    }
}
