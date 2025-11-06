package com.veiman.vemaflow.dto;

public class ComentarioRequestDTO {
    private String conteudo;
    private String autorNome; // opcional, pode vir do usuário logado mais tarde

    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }

    public String getAutorNome() { return autorNome; }
    public void setAutorNome(String autorNome) { this.autorNome = autorNome; }
}
