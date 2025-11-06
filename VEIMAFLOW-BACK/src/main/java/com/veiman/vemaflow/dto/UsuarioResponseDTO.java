package com.veiman.vemaflow.dto;

public class UsuarioResponseDTO {

    private Long id;
    private String nome;
    private String email;
    private String cargo;
    private boolean ativo;
    private boolean oauth;

    public UsuarioResponseDTO() {}

    public UsuarioResponseDTO(Long id, String nome, String email, String cargo, boolean ativo, boolean oauth) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.cargo = cargo;
        this.ativo = ativo;
        this.oauth = oauth;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public boolean isOauth() {
        return oauth;
    }

    public void setOauth(boolean oauth) {
        this.oauth = oauth;
    }
}
