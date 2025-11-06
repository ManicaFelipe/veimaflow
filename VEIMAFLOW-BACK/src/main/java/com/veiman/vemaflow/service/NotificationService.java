package com.veiman.vemaflow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * NotificationService - Adapter for sending notifications
 * Feature-flagged; can be extended with email/push/Slack implementations
 */
@Service
public class NotificationService {

    @Value("${notifications.email.enabled:false}")
    private boolean emailEnabled; // Feature flag; toggle via application.properties

    public void enviarLembreteMarco(String destinatario, String nomeMarco, String nomeProjeto, int diasRestantes) {
        if (emailEnabled) {
            enviarEmail(destinatario, "Lembrete: Marco " + nomeMarco + " em " + diasRestantes + " dias",
                    "O marco \"" + nomeMarco + "\" do projeto \"" + nomeProjeto + "\" está próximo (" + diasRestantes + " dias restantes).");
        } else {
            // Fallback: apenas log
            System.out.println("[NOTIFICAÇÃO] Para: " + destinatario + " | Marco: " + nomeMarco + " | Dias restantes: " + diasRestantes);
        }
    }

    private void enviarEmail(String para, String assunto, String corpo) {
        // TODO: integrar com JavaMailSender ou serviço externo (SendGrid, AWS SES)
        System.out.println("[EMAIL] Para: " + para + " | Assunto: " + assunto + " | Corpo: " + corpo);
    }

    public void enviarMencao(String mencionado, Long tarefaId, String autor, String trecho) {
        String mensagem = String.format("Você foi mencionado por %s na tarefa #%d: %s", autor, tarefaId, trecho);
        if (emailEnabled) {
            enviarEmail(mencionado + "@exemplo.com", "Menção em comentário", mensagem);
        } else {
            System.out.println("[MENCAO] Para: " + mencionado + " | Tarefa: " + tarefaId + " | Autor: " + autor + " | Trecho: " + trecho);
        }
    }
}
