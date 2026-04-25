package com.example.kino.DTO.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CinemaResponseDTO {

    private int cinemaId;
    private String name;
    private String address;
    private String manager;
    private int maxHalls;
    private String imageUrl;

    private List<HallResponseDTO> hallList;
}
