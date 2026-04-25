package com.example.kino.exception;

public class MaxHallsReachedException extends RuntimeException {
    public MaxHallsReachedException(int cinemaId)
    {
        super("Cannot create hall: cinema with ID " + cinemaId + " has reached its maximum number of halls");
    }
}
