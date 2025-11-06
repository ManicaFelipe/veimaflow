package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.LembreteMarcoDTO;
import com.veiman.vemaflow.model.MarcoProjeto;
import com.veiman.vemaflow.repository.MarcoProjetoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class MarcoLembreteService {
    private static final Logger log = LoggerFactory.getLogger(MarcoLembreteService.class);

    private final MarcoProjetoRepository repo;
    private final NotificationService notificationService;

    public MarcoLembreteService(MarcoProjetoRepository repo, NotificationService notificationService) {
        this.repo = repo;
        this.notificationService = notificationService;
    }

    // Executa diariamente às 08:00
    @Scheduled(cron = "0 0 8 * * *")
    public void agendarAvisosDiarios() {
        try {
            List<LembreteMarcoDTO> proximos = listarProximos(14); // janela padrão 14 dias
            proximos.forEach(m -> {
                log.info("[LEMBRETE MARCO] Em {} dia(s): '{}' (projeto {}), data {} resp. {}",
                        m.getDiasRestantes(), m.getTitulo(), m.getProjetoId(), m.getData(), m.getResponsavelNome());
                // Envia notificação via adapter (feature-flagged)
                notificationService.enviarLembreteMarco(
                        m.getResponsavelNome() != null ? m.getResponsavelNome() : "sem-responsavel@example.com",
                        m.getTitulo(),
                        "Projeto #" + m.getProjetoId(),
                        m.getDiasRestantes()
                );
            });
        } catch (Exception e) {
            log.warn("Falha ao executar lembretes de marcos: {}", e.getMessage());
        }
    }

    public List<LembreteMarcoDTO> listarProximos(int diasJanela) {
        LocalDate hoje = LocalDate.now();
        LocalDate limite = hoje.plusDays(Math.max(1, diasJanela));
        return repo.findByDataBetweenOrderByDataAsc(hoje, limite).stream()
                .filter(m -> {
                    Integer lembrete = m.getLembreteDiasAntes();
                    if (lembrete == null) return false;
                    long faltam = ChronoUnit.DAYS.between(hoje, m.getData());
                    return faltam >= 0 && faltam <= lembrete; // dentro do limite do próprio marco
                })
                .map(this::toDTO)
                .toList();
    }

    private LembreteMarcoDTO toDTO(MarcoProjeto m) {
        LocalDate hoje = LocalDate.now();
        int faltam = (int) Math.max(0, ChronoUnit.DAYS.between(hoje, m.getData()));
        LembreteMarcoDTO d = new LembreteMarcoDTO();
        d.setId(m.getId());
        d.setProjetoId(m.getProjeto() != null ? m.getProjeto().getId() : null);
        d.setTitulo(m.getTitulo());
        d.setData(m.getData());
        d.setResponsavelNome(m.getResponsavelNome());
        d.setDiasRestantes(faltam);
        return d;
    }
}
