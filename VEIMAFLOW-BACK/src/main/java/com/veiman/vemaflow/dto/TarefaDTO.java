package com.veiman.vemaflow.dto;

import com.veiman.vemaflow.enums.PrioridadeTarefa;
import com.veiman.vemaflow.enums.StatusTarefa;

import java.time.LocalDate;

public class TarefaDTO {

    private Long id;
    private String codigo;
    private String titulo;
    private String descricao;
    private PrioridadeTarefa prioridade;
    private StatusTarefa status;
    private Long projetoId;
    private Long usuarioId;
    private String nomeUsuario;
    private String timeUsuario;
    private LocalDate dataCriacao;
    private LocalDate dataAtualizacao;
    private LocalDate dataFim;
    private Integer progressoPercent; // 0..100 (com base nas subtarefas)

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

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

    public StatusTarefa getStatus() {
        return status;
    }

    public void setStatus(StatusTarefa status) {
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

    public LocalDate getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDate dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDate getDataAtualizacao() {
        return dataAtualizacao;
    }

    public void setDataAtualizacao(LocalDate dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public Integer getProgressoPercent() { return progressoPercent; }
    public void setProgressoPercent(Integer progressoPercent) { this.progressoPercent = progressoPercent; }
}
