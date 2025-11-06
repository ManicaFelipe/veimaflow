package com.veiman.vemaflow.dto;

public class OtpRequestDTO {

    private String email;
    private String codigo;

    public OtpRequestDTO() {}

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}


