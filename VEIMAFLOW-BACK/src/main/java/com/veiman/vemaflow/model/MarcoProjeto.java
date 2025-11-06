package com.veiman.vemaflow.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "marcos")
public class MarcoProjeto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projeto_id", nullable = false)
    private Projeto projeto;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false)
    private LocalDate data;

    @Column(name = "responsavel_nome")
    private String responsavelNome;

    @Column(name = "lembrete_dias_antes")
    private Integer lembreteDiasAntes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Projeto getProjeto() { return projeto; }
    public void setProjeto(Projeto projeto) { this.projeto = projeto; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
    public String getResponsavelNome() { return responsavelNome; }
    public void setResponsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; }
    public Integer getLembreteDiasAntes() { return lembreteDiasAntes; }
    public void setLembreteDiasAntes(Integer lembreteDiasAntes) { this.lembreteDiasAntes = lembreteDiasAntes; }
}
