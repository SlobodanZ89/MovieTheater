package com.example.kino.DTO.response;

import com.example.kino.entity.Hall;
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
public class HallResponseDTO {

    private int hallId;
    private String name;
    private int rows;
    private int cols;
    private int capacity;
    private List<String> layoutRows;
    private MovieVersion supportedMovieVersion;

    public HallResponseDTO(Hall hall) {
        this.hallId = hall.getHallId();
        this.name = hall.getName();
        this.rows = hall.getRows();
        this.cols = hall.getCols();
        this.layoutRows = hall.getLayoutRows();
        this.capacity = calculateCapacity(hall);
        this.supportedMovieVersion = hall.getSupportedMovieVersion();
    }

    private int calculateCapacity(Hall hall) {
        if (hall.getLayoutRows() == null) return 0;
        int count = 0;
        for (String row : hall.getLayoutRows()) {
            for (int i = 0; i < row.length(); i++) {
                if (row.charAt(i) == '1') count++;
            }
        }
        return count;
    }
}
