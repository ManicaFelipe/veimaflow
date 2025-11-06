package com.veiman.vemaflow.service;

import com.veiman.vemaflow.dto.TimeRequestDTO;
import com.veiman.vemaflow.model.Time;
import com.veiman.vemaflow.repository.TimeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class TimeService {

    private static final Logger logger = LoggerFactory.getLogger(TimeService.class);
    private final TimeRepository timeRepository;

    public TimeService(TimeRepository timeRepository) {
        this.timeRepository = timeRepository;
    }

    public Time criarTime(TimeRequestDTO dto) {
        logger.info("Solicitação para criar time: {}", dto.getNome());

        try {
            long total = timeRepository.count();
            String uuid = String.format("%05d", total + 1);

            Time time = new Time();
            time.setUuid(uuid);
            time.setNome(dto.getNome());

            Time salvo = timeRepository.save(time);
            logger.info("Time criado com UUID: {} e nome: {}", salvo.getUuid(), salvo.getNome());
            return salvo;

        } catch (DataIntegrityViolationException e) {
            logger.error("Nome de time duplicado: {}", dto.getNome());
            throw new RuntimeException("Já existe um time com esse nome.");
        } catch (Exception e) {
            logger.error("Erro inesperado ao criar time: {}", e.getMessage());
            throw new RuntimeException("Erro ao criar time.");
        }
    }
}
