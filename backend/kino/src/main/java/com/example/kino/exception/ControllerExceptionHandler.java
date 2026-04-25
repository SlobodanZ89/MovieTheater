package com.example.kino.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class ControllerExceptionHandler extends ResponseEntityExceptionHandler {
    @ExceptionHandler(CinemaNotFoundException.class)
    public ProblemDetail handleCinemaNotFound(CinemaNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problemDetail.setTitle("Cinema Not Found");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setProperty("errorCode", "CINEMA_NOT_FOUND");
        return problemDetail;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericError(Exception ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problemDetail.setTitle("Internal Server Error");
        problemDetail.setDetail("An unexpected error occurred. Please try again later.");
        problemDetail.setProperty("errorCode", "INTERNAL_ERROR");
        return problemDetail;
    }

    @ExceptionHandler(CinemaDeletionException.class)
    public ProblemDetail handleCinemaDeletion(CinemaDeletionException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        problemDetail.setTitle("Cinema Deletion Not Allowed");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setProperty("errorCode", "CINEMA_DELETION_CONFLICT");
        return problemDetail;
    }

    @ExceptionHandler(MaxHallsReachedException.class)
    public ProblemDetail handleMaxHallsReached(MaxHallsReachedException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        problemDetail.setTitle("Max Halls Limit Reached");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setProperty("errorCode", "MAX_HALLS_REACHED");
        return problemDetail;
    }

    @ExceptionHandler(HallNotFoundException.class)
    public ProblemDetail handleHallNotFound(HallNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problemDetail.setTitle("Hall Not Found");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setProperty("errorCode", "HALL_NOT_FOUND");
        return problemDetail;
    }

    @ExceptionHandler(HallModificationNotAllowedException.class)
    public ProblemDetail handleHallModificationNotAllowed(HallModificationNotAllowedException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        problemDetail.setTitle("Hall Modification Not Allowed");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setProperty("errorCode", "HALL_MODIFICATION_CONFLICT");
        return problemDetail;
    }

    @ExceptionHandler(UnsupportedMovieVersionException.class)
    public ProblemDetail handleUnsupportedMovieVersion(UnsupportedMovieVersionException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        problemDetail.setTitle("Unsupported Movie Version");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setProperty("errorCode", "UNSUPPORTED_MOVIE_VERSION");
        return problemDetail;
    }

    @ExceptionHandler(MovieNotFoundException.class)
    public ProblemDetail handleMovieNotFound(MovieNotFoundException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problemDetail.setTitle("Movie Not Found");
        problemDetail.setDetail(ex.getMessage());
        problemDetail.setProperty("errorCode", "MOVIE_NOT_FOUND");
        return problemDetail;
    }
}
