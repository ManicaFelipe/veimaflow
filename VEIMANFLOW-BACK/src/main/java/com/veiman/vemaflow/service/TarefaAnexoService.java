package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.TarefaAnexoDTO;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.model.TarefaAnexo;
import com.veiman.vemaflow.repository.TarefaAnexoRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TarefaAnexoService {

    private final TarefaRepository tarefaRepository;
    private final TarefaAnexoRepository anexoRepository;

    public List<TarefaAnexoDTO> listar(Long tarefaId) {
        return anexoRepository.findByTarefaIdOrderByCriadoEmAsc(tarefaId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TarefaAnexoDTO upload(Long tarefaId, MultipartFile file) throws IOException {
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new IllegalArgumentException("Tarefa não encontrada: " + tarefaId));
        TarefaAnexo anexo = new TarefaAnexo();
        anexo.setTarefa(tarefa);
        anexo.setNomeArquivo(file.getOriginalFilename());
        anexo.setContentType(file.getContentType());
        anexo.setTamanho(file.getSize());
        anexo.setDados(file.getBytes());
        anexo = anexoRepository.save(anexo);
        return toDTO(anexo);
    }

    public TarefaAnexo obterEntidade(Long anexoId) {
        return anexoRepository.findById(anexoId)
                .orElseThrow(() -> new IllegalArgumentException("Anexo não encontrado: " + anexoId));
    }

    public void remover(Long anexoId) {
        if (!anexoRepository.existsById(anexoId)) {
            throw new IllegalArgumentException("Anexo não encontrado: " + anexoId);
        }
        anexoRepository.deleteById(anexoId);
    }

    private TarefaAnexoDTO toDTO(TarefaAnexo a) {
        return TarefaAnexoDTO.builder()
                .id(a.getId())
                .nomeArquivo(a.getNomeArquivo())
                .contentType(a.getContentType())
                .tamanho(a.getTamanho())
                .criadoEm(a.getCriadoEm())
                .tarefaId(a.getTarefa() != null ? a.getTarefa().getId() : null)
                .build();
    }
}
