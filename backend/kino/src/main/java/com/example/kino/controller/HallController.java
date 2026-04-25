package com.example.kino.controller;

import com.example.kino.DTO.request.HallRequestDTO;
import com.example.kino.DTO.response.HallResponseDTO;
import com.example.kino.services.HallService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@AllArgsConstructor
@RestController
@RequestMapping("api/hall")
public class HallController {

    private final HallService hallService;

    @PostMapping
    public ResponseEntity<HallResponseDTO> createHall(@RequestBody HallRequestDTO hallRequestDTO) {
        return new ResponseEntity<>(hallService.createHall(hallRequestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/{hallId}")
    public HallResponseDTO updateHall(@PathVariable int hallId, @RequestBody HallRequestDTO hallRequestDTO) {
        return hallService.updateHall(hallId, hallRequestDTO);
    }

    @GetMapping("/{hallId}")
    public HallResponseDTO getHall(@PathVariable int hallId) {
        return hallService.getHallById(hallId);
    }

}
