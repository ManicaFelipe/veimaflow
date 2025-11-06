package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.UsuarioRequestDTO;
import com.veiman.vemaflow.dto.UsuarioResponseDTO;
import com.veiman.vemaflow.model.Usuario;
import com.veiman.vemaflow.repository.UsuarioRepository;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UsuarioService {

    private static final Logger logger = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponseDTO> listarTodos() {
        logger.info("Listando todos os usuários...");
        List<Usuario> usuarios = usuarioRepository.findAll();
        logger.debug("Total de usuários encontrados: {}", usuarios.size());

        return usuarios.stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        logger.info("Criando novo usuário com email: {}", dto.getEmail());

        try {
            Usuario usuario = new Usuario();
            usuario.setNome(dto.getNome());
            usuario.setEmail(dto.getEmail());
            usuario.setCargo(dto.getFuncao());
            usuario.setSenha(dto.getSenha()); // Em breve será criptografada
            usuario.setAtivo(true); // Evita erro de tipo primitivo
            usuario.setOauth(false); // Padrão para criação manual
            usuario.setTime(dto.getTime());


            Usuario salvo = usuarioRepository.save(usuario);
            logger.debug("Usuário criado com ID: {}", salvo.getId());

            return toResponseDTO(salvo);

        } catch (DataIntegrityViolationException e) {
            logger.error("Erro de integridade ao salvar usuário: {}", e.getMessage());
            throw new RuntimeException("Erro ao salvar usuário. Verifique se o email já está em uso.");
        } catch (Exception e) {
            logger.error("Erro inesperado ao criar usuário: {}", e.getMessage());
            throw new RuntimeException("Erro inesperado ao criar usuário.");
        }
    }

    public void validarSenha(Usuario usuario, String senhaInformada) {
        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            logger.warn("Usuário {} não possui senha definida.", usuario.getEmail());
            throw new RuntimeException("Usuário sem senha definida.");
        }

        if (!passwordEncoder.matches(senhaInformada, usuario.getSenha())) {
            logger.warn("Senha incorreta para o usuário: {}", usuario.getEmail());
            throw new RuntimeException("Senha inválida.");
        }

        logger.info("Senha validada com sucesso para o usuário: {}", usuario.getEmail());
    }

    public UsuarioResponseDTO buscarPorId(Long id) {
        logger.info("Buscando usuário por ID: {}", id);

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Usuário não encontrado com ID: {}", id);
                    return new NoSuchElementException("Usuário não encontrado com ID: " + id);
                });

        logger.debug("Usuário encontrado: {}", usuario.getEmail());
        return toResponseDTO(usuario);
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado com email: " + email));
    }

    public Usuario salvarOuAtualizar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void gerarOtpSecret(Usuario usuario) {
        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        usuario.setOtpSecret(key.getKey());
        usuarioRepository.save(usuario);
    }

    public boolean validarOtp(String email, String codigo) {
        Usuario usuario = buscarPorEmail(email);
        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        return gAuth.authorize(usuario.getOtpSecret(), Integer.parseInt(codigo));
    }

    private UsuarioResponseDTO toResponseDTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getCargo(),
                usuario.getAtivo(),
                usuario.getOauth()

        );
    }
}
