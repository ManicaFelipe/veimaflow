package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.TimeRequestDTO;
import com.veiman.vemaflow.model.Time;
import com.veiman.vemaflow.service.TimeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/times")
public class TimeController {

    private final TimeService timeService;

    public TimeController(TimeService timeService) {
        this.timeService = timeService;
    }

    @PostMapping
    public ResponseEntity<Time> criar(@RequestBody TimeRequestDTO dto) {
        Time time = timeService.criarTime(dto);
        return ResponseEntity.ok(time);
    }
}

