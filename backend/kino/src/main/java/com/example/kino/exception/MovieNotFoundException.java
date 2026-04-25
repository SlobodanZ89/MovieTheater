package com.example.kino.exception;

public class MovieNotFoundException extends RuntimeException {
    public MovieNotFoundException(int movieId) {
        super("The movie with ID " + movieId + " does not exist");
    }
}
