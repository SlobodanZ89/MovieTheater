package com.example.kino.controller;

import com.example.kino.DTO.request.MovieRequestDTO;
import com.example.kino.DTO.response.MovieResponseDTO;
import com.example.kino.enums.MovieVersion;
import com.example.kino.services.MoviePosterService;
import com.example.kino.services.MovieService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("api/movie")
public class MovieController {

    private final MovieService movieService;
    private final MoviePosterService moviePosterService;

    @PostMapping
    public ResponseEntity<MovieResponseDTO> createMovie(@RequestBody MovieRequestDTO movieRequestDTO) {
        return new ResponseEntity<>(movieService.createMovie(movieRequestDTO), HttpStatus.CREATED);
    }

    @GetMapping
    public List<MovieResponseDTO> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("/{movieVersion}")
    public List<MovieResponseDTO> getMovieVersion(@PathVariable MovieVersion movieVersion) {
        return movieService.getMovieVersion(movieVersion);
    }

    @GetMapping("/search")
    public List<MovieResponseDTO> search(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "version", required = false) MovieVersion version
    ) {
        return movieService.searchByTitle(query, version);
    }

    @PostMapping("/{movieId}/hall/{hallId}")
    public MovieResponseDTO setMovieToNewHall(@PathVariable int movieId, @PathVariable int hallId) {
        return movieService.setMovieToNewHall(movieId, hallId);
    }

    @PostMapping("/refresh-posters")
    public ResponseEntity<Map<String, Object>> refreshPosters(
            @RequestParam(name = "force", defaultValue = "false") boolean force
    ) {
        int updated = movieService.refreshPosters(force);
        return ResponseEntity.ok(Map.of("updated", updated, "force", force));
    }

    @GetMapping("/omdb-test")
    public ResponseEntity<Map<String, Object>> omdbTest(
            @RequestParam("title") String title,
            @RequestParam(name = "year", required = false) String year
    ) {
        MoviePosterService.OmdbMovieResponse r = moviePosterService.fetchByTitleAndYearRaw(title, year);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("title", title);
        out.put("year", year);
        if (r == null) {
            out.put("response", null);
            return ResponseEntity.ok(out);
        }
        out.put("Response", r.Response());
        out.put("Poster", r.Poster());
        out.put("imdbID", r.imdbID());
        out.put("Error", r.Error());
        return ResponseEntity.ok(out);
    }
}
