package com.veiman.vemaflow.config;

import com.veiman.vemaflow.model.Usuario;
import com.veiman.vemaflow.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
@Profile("dev")
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initData(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Verifica se já existe algum usuário
            if (usuarioRepository.count() > 0) {
                logger.info("Banco de dados já possui usuários. Pulando inicialização de dados.");
                return;
            }

            logger.info("Inicializando banco de dados com usuários de teste...");

            // Criar usuário admin
            Usuario admin = new Usuario();
            admin.setNome("Felipe Manica");
            admin.setEmail("felipe@exemplo.com");
            admin.setSenha(passwordEncoder.encode("senha123"));
            admin.setCargo("Desenvolvedor");
            admin.setTime("TI");
            admin.setAtivo(true);
            admin.setOauth(false);
            admin.setDataCadastro(LocalDate.now());
            usuarioRepository.save(admin);
            logger.info("Usuário admin criado: {}", admin.getEmail());

            // Criar mais alguns usuários de teste
            Usuario user1 = new Usuario();
            user1.setNome("Maria Silva");
            user1.setEmail("maria@exemplo.com");
            user1.setSenha(passwordEncoder.encode("senha123"));
            user1.setCargo("Designer");
            user1.setTime("Design");
            user1.setAtivo(true);
            user1.setOauth(false);
            user1.setDataCadastro(LocalDate.now());
            usuarioRepository.save(user1);

            Usuario user2 = new Usuario();
            user2.setNome("João Santos");
            user2.setEmail("joao@exemplo.com");
            user2.setSenha(passwordEncoder.encode("senha123"));
            user2.setCargo("Gerente de Projetos");
            user2.setTime("Gestão");
            user2.setAtivo(true);
            user2.setOauth(false);
            user2.setDataCadastro(LocalDate.now());
            usuarioRepository.save(user2);

            logger.info("Total de {} usuários criados no banco de dados.", usuarioRepository.count());
        };
    }
}
