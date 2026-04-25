package com.example.kino.DTO.request;

import com.example.kino.enums.MovieVersion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class HallRequestDTO {

    private String name;
    private int rows;
    private int cols;
    private List<String> layoutRows;
    private MovieVersion supportedMovieVersion;

    private int cinemaId;
}
