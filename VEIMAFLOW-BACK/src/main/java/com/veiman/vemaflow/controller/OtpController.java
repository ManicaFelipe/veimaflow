package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.OtpRequestDTO;
import com.veiman.vemaflow.model.Usuario;
import com.veiman.vemaflow.service.OtpService;
import com.veiman.vemaflow.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/2fa")
public class OtpController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private OtpService otpService;

    @PostMapping("/enviar")
    public ResponseEntity<?> enviar(@RequestParam String email) {
        Usuario usuario = usuarioService.buscarPorEmail(email);
        otpService.enviarCodigo(usuario);
        return ResponseEntity.ok("Código enviado.");
    }

    @PostMapping("/validar")
    public ResponseEntity<?> validar(@RequestBody OtpRequestDTO dto) {
        Usuario usuario = usuarioService.buscarPorEmail(dto.getEmail());
        boolean valido = otpService.validarCodigo(usuario, dto.getCodigo());

        if (!valido) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Código inválido.");
        }

        return ResponseEntity.ok("Código verificado com sucesso.");
    }
}

