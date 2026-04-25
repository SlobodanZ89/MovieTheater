package com.example.kino.DTO.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CinemaRequestDTO {

    private String name;
    private String address;
    private String manager;
    private int maxHalls;
    private String imageUrl;
}
