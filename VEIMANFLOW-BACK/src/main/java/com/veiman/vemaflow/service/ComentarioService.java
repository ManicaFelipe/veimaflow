package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.ComentarioDTO;
import com.veiman.vemaflow.dto.ComentarioRequestDTO;
import com.veiman.vemaflow.model.Comentario;
import com.veiman.vemaflow.model.Tarefa;
import com.veiman.vemaflow.repository.ComentarioRepository;
import com.veiman.vemaflow.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ComentarioService {

    private final ComentarioRepository comentarioRepository;
    private final TarefaRepository tarefaRepository;
    private final NotificationService notificationService;

    public ComentarioService(ComentarioRepository comentarioRepository, TarefaRepository tarefaRepository, NotificationService notificationService) {
        this.comentarioRepository = comentarioRepository;
        this.tarefaRepository = tarefaRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ComentarioDTO> listarPorTarefa(Long tarefaId) {
        // garante que a tarefa exista
        tarefaRepository.findById(tarefaId).orElseThrow(() -> new NoSuchElementException("Tarefa não encontrada com ID: " + tarefaId));
        return comentarioRepository.findByTarefaIdOrderByCriadoEmAsc(tarefaId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public ComentarioDTO criar(Long tarefaId, ComentarioRequestDTO dto) {
        if (dto == null || dto.getConteudo() == null || dto.getConteudo().trim().isEmpty()) {
            throw new IllegalArgumentException("Conteúdo do comentário é obrigatório");
        }
        Tarefa tarefa = tarefaRepository.findById(tarefaId)
                .orElseThrow(() -> new NoSuchElementException("Tarefa não encontrada com ID: " + tarefaId));

        Comentario c = new Comentario();
        c.setTarefa(tarefa);
        c.setAutorNome(dto.getAutorNome() == null || dto.getAutorNome().isBlank() ? "Sistema" : dto.getAutorNome().trim());
        c.setConteudo(dto.getConteudo().trim());
        c.setCriadoEm(LocalDateTime.now());
        Comentario salvo = comentarioRepository.save(c);
        // Detecta menções no conteúdo e dispara notificações
        detectarEMencionar(c.getConteudo(), c.getAutorNome(), tarefa.getId());
        return toDTO(salvo);
    }

    private ComentarioDTO toDTO(Comentario c) {
        return new ComentarioDTO(
                c.getId(),
                c.getTarefa() != null ? c.getTarefa().getId() : null,
                c.getAutorNome(),
                c.getConteudo(),
                c.getCriadoEm()
        );
    }

    private void detectarEMencionar(String texto, String autor, Long tarefaId) {
        if (texto == null || texto.isBlank()) return;
        // Regex simples para capturar @nome (letras, números, ., -, _)
        var matcher = java.util.regex.Pattern.compile("@([A-Za-z0-9._-]{2,})").matcher(texto);
        java.util.Set<String> mencionados = new java.util.HashSet<>();
        while (matcher.find()) {
            String usuario = matcher.group(1);
            if (usuario != null && !usuario.isBlank()) mencionados.add(usuario);
        }
        for (String m : mencionados) {
            notificationService.enviarMencao(m, tarefaId, autor, texto.length() > 120 ? texto.substring(0, 120) + "…" : texto);
        }
    }
}
