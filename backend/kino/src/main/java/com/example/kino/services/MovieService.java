package com.example.kino.services;

import com.example.kino.DTO.request.MovieRequestDTO;
import com.example.kino.DTO.response.HallResponseDTO;
import com.example.kino.DTO.response.MovieResponseDTO;
import com.example.kino.entity.Hall;
import com.example.kino.entity.Movie;
import com.example.kino.entity.Movie_plays_in;
import com.example.kino.enums.MovieVersion;
import com.example.kino.exception.HallNotFoundException;
import com.example.kino.exception.MovieNotFoundException;
import com.example.kino.repositories.HallRepository;
import com.example.kino.repositories.MovieRepository;
import com.example.kino.repositories.Movie_plays_inRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@AllArgsConstructor
@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final HallRepository hallRepository;
    private final Movie_plays_inRepository movie_plays_inRepository;
    private final MoviePosterService moviePosterService;
    private final ExternalMovieService externalMovieService;

    public MovieResponseDTO createMovie(MovieRequestDTO movieRequestDTO) {
        Movie movie = new Movie();

        movie.setTitle(movieRequestDTO.getTitle());
        movie.setMainCharacter(movieRequestDTO.getMainCharacter());
        movie.setDescription(movieRequestDTO.getDescription());
        movie.setPremieredAt(movieRequestDTO.getPremieredAt());
        movie.setMovieVersion(movieRequestDTO.getMovieVersion());
        ExternalMovieService.OmdbMovieDetails details = externalMovieService.fetchDetailsByTitle(
                movieRequestDTO.getTitle(),
                movieRequestDTO.getPremieredAt()
        );
        movie.setPosterUrl(externalMovieService.toPosterPath(details));
        movie.setGenre(details != null ? details.Genre() : null);
        movie.setPlot(details != null ? details.Plot() : null);
        movie.setRuntimeMinutes(ExternalMovieService.runtimeMinutes(details != null ? details.Runtime() : null));
        movieRepository.save(movie);

        List<HallResponseDTO> halls = new ArrayList<>();
        for(Integer hallId : movieRequestDTO.getHalls()){
            Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new HallNotFoundException(hallId));

            Movie_plays_in movie_plays_in = new Movie_plays_in();
            movie_plays_in.setMovie(movie);
            movie_plays_in.setHall(hall);
            movie_plays_inRepository.save(movie_plays_in);

            halls.add(new HallResponseDTO(hall));
        }

        return new MovieResponseDTO(movie);
    }

    public List<MovieResponseDTO> getAllMovies() {
        List<Movie> movies = movieRepository.findAll();
        List<MovieResponseDTO> movieResponseDTOList = new ArrayList<>();
        for (Movie movie : movies) {
            List<Movie_plays_in> moviePlaysInList = movie_plays_inRepository.findByMovie(movie);
            List<HallResponseDTO> halls = new ArrayList<>();
            for (Movie_plays_in movie_plays_in : moviePlaysInList) {
                halls.add(new HallResponseDTO(movie_plays_in.getHall()));
            }
            MovieResponseDTO movieResponseDTO = new MovieResponseDTO(movie);
            movieResponseDTO.setHalls(halls);
            movieResponseDTOList.add(movieResponseDTO);
        }
        return movieResponseDTOList;
    }

    public List<MovieResponseDTO> getMovieVersion(MovieVersion movieVersion) {
        List<Movie> movies = movieRepository.findAll();
        List<MovieResponseDTO> filteredMovies = new ArrayList<>();

        for (Movie movie : movies) {
            List<Movie_plays_in> moviePlaysInList = movie_plays_inRepository.findByMovie(movie);
            List<HallResponseDTO> halls = new ArrayList<>();
            for (Movie_plays_in movie_plays_in : moviePlaysInList) {
                halls.add(new HallResponseDTO(movie_plays_in.getHall()));
            }
            if(movie.getMovieVersion() == movieVersion){
                MovieResponseDTO dto = new MovieResponseDTO(movie);
                dto.setHalls(halls);
                filteredMovies.add(dto);
            }
        }
        return filteredMovies;
    }

    public List<MovieResponseDTO> searchByTitle(String query, MovieVersion version) {
        if (query == null || query.isBlank()) {
            return version != null ? getMovieVersion(version) : getAllMovies();
        }

        List<Movie> movies = movieRepository.findByTitleContainingIgnoreCase(query.trim());
        List<MovieResponseDTO> out = new ArrayList<>();
        for (Movie movie : movies) {
            if (version != null && movie.getMovieVersion() != version) continue;

            List<Movie_plays_in> moviePlaysInList = movie_plays_inRepository.findByMovie(movie);
            List<HallResponseDTO> halls = new ArrayList<>();
            for (Movie_plays_in movie_plays_in : moviePlaysInList) {
                halls.add(new HallResponseDTO(movie_plays_in.getHall()));
            }
            MovieResponseDTO dto = new MovieResponseDTO(movie);
            dto.setHalls(halls);
            out.add(dto);
        }
        return out;
    }

    public MovieResponseDTO setMovieToNewHall(int movieId, int hallId){
        Movie movie = movieRepository.findById(movieId).orElseThrow(() -> new MovieNotFoundException(movieId));
        Hall hall = hallRepository.findById(hallId).orElseThrow(() -> new HallNotFoundException(hallId));

        Movie_plays_in movie_plays_in = new Movie_plays_in();
        movie_plays_in.setMovie(movie);
        movie_plays_in.setHall(hall);
        movie_plays_inRepository.save(movie_plays_in);

        List<HallResponseDTO> halls = new ArrayList<>();
        List<Movie_plays_in> moviePlaysInList = movie_plays_inRepository.findByMovie(movie);
        for (Movie_plays_in moviePlaysIn : moviePlaysInList) {
            halls.add(new HallResponseDTO(moviePlaysIn.getHall()));
        }

        MovieResponseDTO dto = new MovieResponseDTO(movie);
        dto.setHalls(halls);
        return dto;
    }

    public int refreshMissingPosters() {
        return refreshPosters(false);
    }

    @Transactional
    public int refreshPosters(boolean force) {
        List<Movie> movies = movieRepository.findAll();
        int updated = 0;

        for (Movie movie : movies) {
            String current = movie.getPosterUrl();
            boolean hasPoster = current != null && !current.isBlank() && !"N/A".equalsIgnoreCase(current.trim());
            if (hasPoster && !force) {
                continue;
            }

            ExternalMovieService.OmdbMovieDetails details = externalMovieService.fetchDetailsByTitle(movie.getTitle(), movie.getPremieredAt());
            String fetched = externalMovieService.toPosterPath(details);
            if (fetched == null || fetched.isBlank()) {
                continue;
            }

            if (!Objects.equals(current, fetched)) {
                movie.setPosterUrl(fetched);
                movie.setGenre(details != null ? details.Genre() : movie.getGenre());
                movie.setPlot(details != null ? details.Plot() : movie.getPlot());
                movie.setRuntimeMinutes(ExternalMovieService.runtimeMinutes(details != null ? details.Runtime() : null));
                updated++;
            }
        }

        return updated;
    }

}
