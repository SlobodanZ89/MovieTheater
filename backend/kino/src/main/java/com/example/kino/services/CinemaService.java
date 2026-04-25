package com.example.kino.services;

import com.example.kino.DTO.request.CinemaRequestDTO;
import com.example.kino.DTO.response.CinemaResponseDTO;
import com.example.kino.DTO.response.HallResponseDTO;
import com.example.kino.entity.Cinema;
import com.example.kino.entity.Hall;
import com.example.kino.exception.CinemaDeletionException;
import com.example.kino.exception.CinemaNotFoundException;
import com.example.kino.repositories.CinemaRepository;
import com.example.kino.repositories.ScreeningRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
@AllArgsConstructor
@Service
public class CinemaService {

    private final CinemaRepository cinemaRepository;
    private final ScreeningRepository screeningRepository;

    public CinemaResponseDTO createCinema(CinemaRequestDTO cinemaRequestDTO) {

        Cinema cinema = new Cinema();
        cinema.setName(cinemaRequestDTO.getName());
        cinema.setAddress(cinemaRequestDTO.getAddress());
        cinema.setManager(cinemaRequestDTO.getManager());
        cinema.setMaxHalls(cinemaRequestDTO.getMaxHalls());
        cinema.setImageUrl(cinemaRequestDTO.getImageUrl());
        cinemaRepository.save(cinema);

        List<HallResponseDTO> hallList = new ArrayList<>();
        if (cinema.getHall() != null) {
            for (Hall hall : cinema.getHall()) {
                hallList.add(new HallResponseDTO(hall));
            }
        }

        return new CinemaResponseDTO(
                cinema.getCinemaId(),
                cinema.getName(),
                cinema.getAddress(),
                cinema.getManager(),
                cinema.getMaxHalls(),
                cinema.getImageUrl(),
                hallList
        );
    }

    public CinemaResponseDTO getCinemaById(int cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId).orElseThrow(() -> new CinemaNotFoundException(cinemaId));

        List<HallResponseDTO> hallList = new ArrayList<>();
        if (cinema.getHall() != null) {
            for (Hall hall : cinema.getHall()) {
                hallList.add(new HallResponseDTO(hall));
            }
        }
        return new CinemaResponseDTO(
                cinema.getCinemaId(),
                cinema.getName(),
                cinema.getAddress(),
                cinema.getManager(),
                cinema.getMaxHalls(),
                cinema.getImageUrl(),
                hallList
        );
    }

    public List<CinemaResponseDTO> getAllCinema() {
        List<Cinema> cinemaList = cinemaRepository.findAll();
        List<CinemaResponseDTO> cinemaResponseDTOList = new ArrayList<>();
        for (Cinema cinema : cinemaList) {
            List<HallResponseDTO> hallList = new ArrayList<>();
            if (cinema.getHall() != null) {
                for (Hall hall : cinema.getHall()) {
                    hallList.add(new HallResponseDTO(hall));
                }
            }

            CinemaResponseDTO cinemaResponseDTO = new CinemaResponseDTO(
                    cinema.getCinemaId(),
                    cinema.getName(),
                    cinema.getAddress(),
                    cinema.getManager(),
                    cinema.getMaxHalls(),
                    cinema.getImageUrl(),
                    hallList
            );
            cinemaResponseDTOList.add(cinemaResponseDTO);
        }
        return cinemaResponseDTOList;
    }

    public String deleteCinemaById(int cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId).orElseThrow(() -> new CinemaNotFoundException(cinemaId));
        cinemaRepository.delete(cinema);
        return "Cinema deleted";
    }
}
