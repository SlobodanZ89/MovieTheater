package com.example.kino.DTO.response;

import com.example.kino.entity.Movie;
import com.example.kino.enums.MovieVersion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class MovieResponseDTO {

    private int movieId;
    private String title;
    private String mainCharacter;
    private String description;
    private String premieredAt;
    private MovieVersion movieVersion;
    private String posterUrl;
    private String genre;
    private String plot;
    private Integer runtimeMinutes;
    private List<HallResponseDTO> halls;

    public MovieResponseDTO(int movieId, String title, String mainCharacter, String description, String premieredAt, MovieVersion movieVersion) {
        this.movieId = movieId;
        this.title = title;
        this.mainCharacter = mainCharacter;
        this.description = description;
        this.premieredAt = premieredAt;
        this.movieVersion = movieVersion;
    }

    public MovieResponseDTO(Movie movie) {
        this.movieId = movie.getMovieId();
        this.title = movie.getTitle();
        this.mainCharacter = movie.getMainCharacter();
        this.description = movie.getDescription();
        this.premieredAt = movie.getPremieredAt();
        this.movieVersion = movie.getMovieVersion();
        this.posterUrl = movie.getPosterUrl();
        this.genre = movie.getGenre();
        this.plot = movie.getPlot();
        this.runtimeMinutes = movie.getRuntimeMinutes();
    }
}
