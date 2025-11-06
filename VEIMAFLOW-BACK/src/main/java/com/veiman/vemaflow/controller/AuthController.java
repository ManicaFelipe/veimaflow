package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.LoginRequestDTO;
import com.veiman.vemaflow.dto.LoginResponseDTO;
import com.veiman.vemaflow.dto.UsuarioResponseDTO;
import com.veiman.vemaflow.model.Usuario;
import com.veiman.vemaflow.repository.UsuarioRepository;
import com.veiman.vemaflow.security.JwtService;
import com.veiman.vemaflow.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioService usuarioService, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioService = usuarioService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        logger.info("Tentativa de login para o email: {}", request.getEmail());

        Usuario usuario = usuarioService.buscarPorEmail(request.getEmail());
        usuarioService.validarSenha(usuario, request.getSenha());

        String token = jwtService.gerarToken(usuario.getEmail());
        logger.info("Token JWT gerado para o usuário: {}", usuario.getEmail());

        UsuarioResponseDTO usuarioDTO = new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCargo(),
                usuario.getAtivo(),
                usuario.getOauth()
        );

        LoginResponseDTO response = new LoginResponseDTO(token, usuarioDTO);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody java.util.Map<String, Object> body) {
        try {
            String nome = safe((String) body.getOrDefault("nome", ""));
            String email = safe((String) body.getOrDefault("email", ""));
            String senha = (String) body.get("senha");
            String cargo = safe((String) body.getOrDefault("cargo", ""));
            String time = safe((String) body.getOrDefault("time", "Geral"));

            if (nome.isBlank() || email.isBlank() || senha == null || senha.isBlank()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", "Nome, email e senha são obrigatórios"));
            }
            if (usuarioRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of("message", "Email já cadastrado"));
            }

            Usuario novo = new Usuario();
            novo.setNome(nome);
            novo.setEmail(email);
            novo.setSenha(passwordEncoder.encode(senha));
            novo.setCargo(cargo);
            novo.setTime(time);
            novo.setAtivo(true);
            novo.setOauth(false);
            novo.setDataCadastro(java.time.LocalDate.now());

            Usuario salvo = usuarioService.salvarOuAtualizar(novo);

            String token = jwtService.gerarToken(salvo.getEmail());
            UsuarioResponseDTO usuarioDTO = new UsuarioResponseDTO(
                    salvo.getId(), salvo.getNome(), salvo.getEmail(), salvo.getCargo(), salvo.getAtivo(), salvo.getOauth()
            );
            LoginResponseDTO response = new LoginResponseDTO(token, usuarioDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            logger.error("Erro no register: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("message", "Erro interno ao registrar"));
        }
    }

    private String safe(String s) { return s == null ? "" : s.trim(); }
}
