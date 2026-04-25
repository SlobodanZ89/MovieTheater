package com.example.kino.DTO.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ScreeningRequestDTO {
    private int movieId;
    private int hallId;
    private LocalDateTime startTime;
}

