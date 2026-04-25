package com.example.kino.controller;

import com.example.kino.DTO.request.ScreeningRequestDTO;
import com.example.kino.DTO.response.ScreeningResponseDTO;
import com.example.kino.services.ScreeningService;
import com.example.kino.services.SeatMapService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping({"/api/screenings", "/screenings"})
public class ScreeningController {

    private final ScreeningService screeningService;
    private final SeatMapService seatMapService;

    @PostMapping
    public ResponseEntity<ScreeningResponseDTO> create(@RequestBody ScreeningRequestDTO dto) {
        return new ResponseEntity<>(screeningService.createScreening(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ScreeningResponseDTO> getAll() {
        return screeningService.getAllScreenings();
    }

    @GetMapping("/{id}/seat-map")
    public int[][] getSeatMap(@PathVariable int id) {
        return seatMapService.getSeatMap(id);
    }
}

