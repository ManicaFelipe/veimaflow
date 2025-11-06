package com.veiman.vemaflow.dto;

import java.time.LocalDateTime;

public class ComentarioDTO {
    private Long id;
    private Long tarefaId;
    private String autorNome;
    private String conteudo;
    private LocalDateTime criadoEm;

    public ComentarioDTO() {}

    public ComentarioDTO(Long id, Long tarefaId, String autorNome, String conteudo, LocalDateTime criadoEm) {
        this.id = id;
        this.tarefaId = tarefaId;
        this.autorNome = autorNome;
        this.conteudo = conteudo;
        this.criadoEm = criadoEm;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTarefaId() { return tarefaId; }
    public void setTarefaId(Long tarefaId) { this.tarefaId = tarefaId; }

    public String getAutorNome() { return autorNome; }
    public void setAutorNome(String autorNome) { this.autorNome = autorNome; }

    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
