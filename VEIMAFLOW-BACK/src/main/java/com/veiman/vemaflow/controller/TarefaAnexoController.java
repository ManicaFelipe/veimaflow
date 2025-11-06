package com.veiman.vemaflow.controller;

import com.veiman.vemaflow.dto.TarefaAnexoDTO;
import com.veiman.vemaflow.model.TarefaAnexo;
import com.veiman.vemaflow.service.TarefaAnexoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TarefaAnexoController {

    private final TarefaAnexoService service;

    @GetMapping("/tarefas/{tarefaId}/anexos")
    public List<TarefaAnexoDTO> listar(@PathVariable Long tarefaId) {
        return service.listar(tarefaId);
    }

    @PostMapping(value = "/tarefas/{tarefaId}/anexos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TarefaAnexoDTO> upload(@PathVariable Long tarefaId,
                                                 @RequestParam("file") MultipartFile file) throws Exception {
        TarefaAnexoDTO dto = service.upload(tarefaId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/anexos/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) throws UnsupportedEncodingException {
        TarefaAnexo anexo = service.obterEntidade(id);
        String ct = anexo.getContentType() != null ? anexo.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String fileName = anexo.getNomeArquivo() != null ? anexo.getNomeArquivo() : ("anexo-" + id);
        String encoded = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
                .contentType(MediaType.parseMediaType(ct))
                .body(anexo.getDados());
    }

    @DeleteMapping("/anexos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        service.remover(id);
    }
}
