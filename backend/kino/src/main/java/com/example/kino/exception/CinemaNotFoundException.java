package com.example.kino.exception;

public class CinemaNotFoundException extends RuntimeException {
    public CinemaNotFoundException(int cinemaId) {
        super("Cinema with id " + cinemaId + " not found");
    }
}
