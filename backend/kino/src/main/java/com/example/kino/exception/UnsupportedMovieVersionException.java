package com.example.kino.exception;

import com.example.kino.enums.MovieVersion;

public class UnsupportedMovieVersionException extends RuntimeException {
    public UnsupportedMovieVersionException(int hallId, MovieVersion hallVersion, MovieVersion movieVersion) {
        super("Hall with ID " + hallId + " supports " + hallVersion + " but movie is " + movieVersion);
    }
}
