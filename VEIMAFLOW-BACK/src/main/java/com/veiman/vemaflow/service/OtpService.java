package com.veiman.vemaflow.service;

import com.veiman.vemaflow.model.Usuario;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);
    private final JavaMailSender mailSender;
    private final GoogleAuthenticator gAuth = new GoogleAuthenticator();

    public OtpService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Gera um novo segredo OTP para o usuário (caso ainda não tenha).
     */
    public void gerarSegredoSeNecessario(Usuario usuario) {
        if (usuario.getOtpSecret() == null || usuario.getOtpSecret().isEmpty()) {
            GoogleAuthenticatorKey key = gAuth.createCredentials();
            usuario.setOtpSecret(key.getKey());
            logger.info("Novo segredo OTP gerado para o usuário: {}", usuario.getEmail());
        }
    }

    /**
     * Envia o código OTP atual para o e-mail do usuário.
     */
    public void enviarCodigo(Usuario usuario) {
        if (usuario.getEmail() == null || usuario.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Usuário não possui e-mail válido.");
        }

        gerarSegredoSeNecessario(usuario);
        int codigo = gAuth.getTotpPassword(usuario.getOtpSecret());
        logger.info("Código OTP gerado para {}: {}", usuario.getEmail(), codigo);

        SimpleMailMessage message = criarMensagem(usuario, codigo);

        try {
            mailSender.send(message);
            logger.info("Código OTP enviado para o e-mail: {}", usuario.getEmail());
        } catch (Exception e) {
            logger.error("Erro ao enviar e-mail de OTP para {}: {}", usuario.getEmail(), e.getMessage());
            throw new RuntimeException("Erro ao enviar código OTP por e-mail.");
        }
    }

    /**
     * Valida o código OTP informado pelo usuário.
     */
    public boolean validarCodigo(Usuario usuario, String codigo) {
        try {
            int codigoInt = Integer.parseInt(codigo);
            boolean valido = gAuth.authorize(usuario.getOtpSecret(), codigoInt);
            logger.info("Validação OTP para {}: {}", usuario.getEmail(), valido ? "sucesso" : "falhou");
            return valido;
        } catch (NumberFormatException e) {
            logger.warn("Código OTP inválido (não numérico): {}", codigo);
            return false;
        } catch (Exception e) {
            logger.error("Erro ao validar código OTP: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Cria a mensagem de e-mail com o código OTP.
     */
    private SimpleMailMessage criarMensagem(Usuario usuario, int codigo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(usuario.getEmail());
        message.setSubject("Seu código de verificação OTP");
        message.setText("Olá " + usuario.getNome() + ",\n\nSeu código de verificação é: " + codigo +
                "\n\nEste código é válido por 30 segundos.\n\nEquipe VemaFlow");
        return message;
    }
}
