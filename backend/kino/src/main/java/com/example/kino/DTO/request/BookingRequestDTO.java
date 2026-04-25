package com.example.kino.DTO.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class BookingRequestDTO {
    private int screeningId;
    private List<SeatDTO> seats;

    @NoArgsConstructor
    @AllArgsConstructor
    @Getter
    @Setter
    public static class SeatDTO {
        private int rowIdx;
        private int colIdx;
    }
}

