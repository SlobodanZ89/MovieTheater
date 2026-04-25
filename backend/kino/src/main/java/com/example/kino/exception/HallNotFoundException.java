package com.example.kino.exception;

public class HallNotFoundException extends RuntimeException {
    public HallNotFoundException(int hallId)
    {
        super("The hall with ID " + hallId + " does not exist");
    }
}
