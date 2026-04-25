package com.example.kino.repositories;

import com.example.kino.entity.Movie;
import com.example.kino.entity.Movie_plays_in;
import com.example.kino.entity.Movie_plays_in_PK;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Movie_plays_inRepository extends JpaRepository<Movie_plays_in, Movie_plays_in_PK> {
    List<Movie_plays_in> findByMovie(Movie movie);
}
