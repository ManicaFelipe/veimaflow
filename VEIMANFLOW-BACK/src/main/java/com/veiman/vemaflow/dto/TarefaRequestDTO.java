package com.veiman.vemaflow.dto;

import com.veiman.vemaflow.enums.PrioridadeTarefa;
// Aceita status como String para tolerar entradas vazias ou rótulos não padronizados do front

public class TarefaRequestDTO {

    private String titulo;
    private String descricao;
    private PrioridadeTarefa prioridade;
    private String status;
    private Long projetoId;
    private Long usuarioId;
    private String nomeUsuario;
    private String timeUsuario;

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public PrioridadeTarefa getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeTarefa prioridade) {
        this.prioridade = prioridade;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getProjetoId() {
        return projetoId;
    }

    public void setProjetoId(Long projetoId) {
        this.projetoId = projetoId;
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getNomeUsuario() {
        return nomeUsuario;
    }

    public void setNomeUsuario(String nomeUsuario) {
        this.nomeUsuario = nomeUsuario;
    }

    public String getTimeUsuario() {
        return timeUsuario;
    }

    public void setTimeUsuario(String timeUsuario) {
        this.timeUsuario = timeUsuario;
    }
}
