package com.example.kino.services;

import com.example.kino.DTO.request.ScreeningRequestDTO;
import com.example.kino.DTO.response.ScreeningResponseDTO;
import com.example.kino.entity.Hall;
import com.example.kino.entity.Movie;
import com.example.kino.entity.Screening;
import com.example.kino.exception.HallNotFoundException;
import com.example.kino.exception.MovieNotFoundException;
import com.example.kino.repositories.HallRepository;
import com.example.kino.repositories.MovieRepository;
import com.example.kino.repositories.ScreeningRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class ScreeningService {

    private final ScreeningRepository screeningRepository;
    private final MovieRepository movieRepository;
    private final HallRepository hallRepository;

    public ScreeningResponseDTO createScreening(ScreeningRequestDTO dto) {
        Movie movie = movieRepository.findById(dto.getMovieId()).orElseThrow(() -> new MovieNotFoundException(dto.getMovieId()));
        Hall hall = hallRepository.findById(dto.getHallId()).orElseThrow(() -> new HallNotFoundException(dto.getHallId()));

        Screening screening = new Screening();
        screening.setMovie(movie);
        screening.setHall(hall);
        screening.setStartTime(dto.getStartTime());
        screening.setOccupiedSeats(0);

        screeningRepository.save(screening);
        return new ScreeningResponseDTO(screening);
    }

    public List<ScreeningResponseDTO> getAllScreenings() {
        return screeningRepository.findAll().stream().map(ScreeningResponseDTO::new).toList();
    }
}

