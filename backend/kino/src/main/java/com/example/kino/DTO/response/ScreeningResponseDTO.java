package com.example.kino.DTO.response;

import com.example.kino.entity.Screening;
import com.example.kino.enums.MovieVersion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ScreeningResponseDTO {
    private int screeningId;
    private int movieId;
    private String movieTitle;
    private MovieVersion movieVersion;
    private String moviePosterUrl;
    private Integer cinemaId;
    private String cinemaName;
    private int hallId;
    private String hallName;
    private LocalDateTime startTime;
    private int occupiedSeats;

    public ScreeningResponseDTO(Screening screening) {
        this.screeningId = screening.getScreeningId();
        this.movieId = screening.getMovie().getMovieId();
        this.movieTitle = screening.getMovie().getTitle();
        this.movieVersion = screening.getMovie().getMovieVersion();
        this.moviePosterUrl = screening.getMovie().getPosterUrl();
        this.cinemaId = screening.getHall().getCinema() != null ? screening.getHall().getCinema().getCinemaId() : null;
        this.cinemaName = screening.getHall().getCinema() != null ? screening.getHall().getCinema().getName() : null;
        this.hallId = screening.getHall().getHallId();
        this.hallName = screening.getHall().getName();
        this.startTime = screening.getStartTime();
        this.occupiedSeats = screening.getOccupiedSeats();
    }
}

