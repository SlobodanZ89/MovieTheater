package com.example.kino.services;

import com.example.kino.entity.Booking;
import com.example.kino.entity.Hall;
import com.example.kino.entity.Screening;
import com.example.kino.entity.SeatCoordinate;
import com.example.kino.repositories.BookingRepository;
import com.example.kino.repositories.ScreeningRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@AllArgsConstructor
@Service
public class SeatMapService {

    private final ScreeningRepository screeningRepository;
    private final BookingRepository bookingRepository;

    public int[][] getSeatMap(int screeningId) {
        Screening screening = screeningRepository.findById(screeningId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Screening not found"));

        Hall hall = screening.getHall();
        if (hall.getLayoutRows() == null || hall.getLayoutRows().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hall layout not configured");
        }

        int rows = hall.getRows();
        int cols = hall.getCols();
        if (hall.getLayoutRows().size() != rows) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hall layout not configured");
        }
        int[][] map = new int[rows][cols];

        for (int r = 0; r < rows; r++) {
            String rowPattern = hall.getLayoutRows().get(r);
            if (rowPattern == null || rowPattern.length() != cols) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Hall layout not configured");
            }
            for (int c = 0; c < cols; c++) {
                map[r][c] = (rowPattern.charAt(c) == '0') ? 0 : 1;
            }
        }

        List<Booking> bookings = bookingRepository.findByScreening(screening);
        Set<String> occupied = new HashSet<>();
        for (Booking booking : bookings) {
            if (booking.getSeats() == null) continue;
            for (SeatCoordinate seat : booking.getSeats()) {
                occupied.add(seat.getRowIdx() + ":" + seat.getColIdx());
            }
        }

        for (String key : occupied) {
            String[] parts = key.split(":");
            int r = Integer.parseInt(parts[0]);
            int c = Integer.parseInt(parts[1]);
            if (r >= 0 && r < rows && c >= 0 && c < cols && map[r][c] == 1) {
                map[r][c] = 2;
            }
        }

        return map;
    }
}

