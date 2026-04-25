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
public class MovieRequestDTO {

    private String title;
    private String mainCharacter;
    private String description;
    private String premieredAt;
    private MovieVersion movieVersion;

    private List<Integer> halls;
}
