package com.example.kino.exception;

public class HallModificationNotAllowedException extends RuntimeException {
    public HallModificationNotAllowedException() {
        super("Changes not allowed while movies are assigned, except DBOX -> RD3 change");
    }
}
