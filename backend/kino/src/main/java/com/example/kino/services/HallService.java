package com.example.kino.services;

import com.example.kino.DTO.request.HallRequestDTO;
import com.example.kino.DTO.response.HallResponseDTO;
import com.example.kino.entity.Cinema;
import com.example.kino.entity.Hall;
import com.example.kino.exception.CinemaNotFoundException;
import com.example.kino.exception.HallNotFoundException;
import com.example.kino.repositories.CinemaRepository;
import com.example.kino.repositories.HallRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@AllArgsConstructor
@Service
public class HallService {

    private final HallRepository hallRepository;
    private final CinemaRepository cinemaRepository;

    public HallResponseDTO createHall(HallRequestDTO hallRequestDTO) {
        Hall hall = new Hall();
        validateLayout(hallRequestDTO);
        hall.setName(hallRequestDTO.getName());
        hall.setRows(hallRequestDTO.getRows());
        hall.setCols(hallRequestDTO.getCols());
        hall.setLayoutRows(hallRequestDTO.getLayoutRows());
        hall.setSupportedMovieVersion(hallRequestDTO.getSupportedMovieVersion());

        Cinema cinema = cinemaRepository.findById(hallRequestDTO.getCinemaId()).orElseThrow(() -> new CinemaNotFoundException(hallRequestDTO.getCinemaId()));

        hall.setCinema(cinema);
        hallRepository.save(hall);
        return new HallResponseDTO(hall);
    }

    public HallResponseDTO updateHall(int hallId, HallRequestDTO hallRequestDTO) {
        Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new HallNotFoundException(hallId));

        validateLayout(hallRequestDTO);
        hall.setName(hallRequestDTO.getName());
        hall.setRows(hallRequestDTO.getRows());
        hall.setCols(hallRequestDTO.getCols());
        hall.setLayoutRows(hallRequestDTO.getLayoutRows());
        hall.setSupportedMovieVersion(hallRequestDTO.getSupportedMovieVersion());

        hallRepository.save(hall);

        return new HallResponseDTO(hall);
    }

    public HallResponseDTO getHallById(int hallId) {
        Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new HallNotFoundException(hallId));
        return new HallResponseDTO(hall);
    }

    private void validateLayout(HallRequestDTO dto) {
        if (dto.getRows() <= 0 || dto.getCols() <= 0) {
            throw new ResponseStatusException(BAD_REQUEST, "rows and cols must be positive");
        }
        if (dto.getLayoutRows() == null || dto.getLayoutRows().size() != dto.getRows()) {
            throw new ResponseStatusException(BAD_REQUEST, "layoutRows must have exactly rows entries");
        }
        for (String row : dto.getLayoutRows()) {
            if (row == null || row.length() != dto.getCols()) {
                throw new ResponseStatusException(BAD_REQUEST, "each layout row must have length cols");
            }
            for (int i = 0; i < row.length(); i++) {
                char c = row.charAt(i);
                if (c != '0' && c != '1') {
                    throw new ResponseStatusException(BAD_REQUEST, "layoutRows must contain only '0' and '1'");
                }
            }
        }
    }
}
