package com.example.kino.controller;

import com.example.kino.DTO.request.CinemaRequestDTO;
import com.example.kino.DTO.response.CinemaResponseDTO;
import com.example.kino.services.CinemaService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@AllArgsConstructor
@RestController
@RequestMapping("api/cinema")
public class CinemaController {

    private final CinemaService cinemaService;

    @PostMapping
    public ResponseEntity<CinemaResponseDTO> createCinema(@RequestBody CinemaRequestDTO requestDTO) {
        return new ResponseEntity<>(cinemaService.createCinema(requestDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{cinemaId}")
    public CinemaResponseDTO getCinema(@PathVariable int cinemaId){
        return cinemaService.getCinemaById(cinemaId);
    }

    @GetMapping()
    public List<CinemaResponseDTO> getAllCinema(){
        return cinemaService.getAllCinema();
    }

    @DeleteMapping("/{cinemaId}")
    public String deleteCinema(@PathVariable int cinemaId){
        return cinemaService.deleteCinemaById(cinemaId);
    }
}
