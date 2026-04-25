package com.example.kino.services;

import com.example.kino.DTO.request.BookingRequestDTO;
import com.example.kino.DTO.response.BookingResponseDTO;
import com.example.kino.entity.*;
import com.example.kino.enums.Role;
import com.example.kino.repositories.AppUserRepository;
import com.example.kino.repositories.BookingRepository;
import com.example.kino.repositories.ScreeningRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@AllArgsConstructor
@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ScreeningRepository screeningRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public BookingResponseDTO createBooking(String username, BookingRequestDTO request) {
        AppUser user = resolveBookingUser(username);

        Screening screening = screeningRepository.findById(request.getScreeningId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Screening not found"));

        if (request.getSeats() == null || request.getSeats().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "seats is required");
        }

        Hall hall = screening.getHall();
        int rows = hall.getRows();
        int cols = hall.getCols();
        List<String> layoutRows = hall.getLayoutRows();
        if (layoutRows == null || layoutRows.size() != rows) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Hall layout not configured");
        }

        Set<String> alreadyOccupied = new HashSet<>();
        for (Booking b : bookingRepository.findByScreening(screening)) {
            if (b.getSeats() == null) continue;
            for (SeatCoordinate seat : b.getSeats()) {
                alreadyOccupied.add(seat.getRowIdx() + ":" + seat.getColIdx());
            }
        }

        Set<String> requestedUnique = new HashSet<>();
        List<SeatCoordinate> seatsToBook = new ArrayList<>();
        for (BookingRequestDTO.SeatDTO seatDTO : request.getSeats()) {
            int r = seatDTO.getRowIdx();
            int c = seatDTO.getColIdx();
            if (r < 0 || r >= rows || c < 0 || c >= cols) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seat out of bounds: " + r + "," + c);
            }
            if (layoutRows.get(r).charAt(c) != '1') {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not a seat (aisle/empty): " + r + "," + c);
            }
            String key = r + ":" + c;
            if (!requestedUnique.add(key)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate seat in request: " + r + "," + c);
            }
            if (alreadyOccupied.contains(key)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat already occupied: " + r + "," + c);
            }
            seatsToBook.add(new SeatCoordinate(r, c));
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setScreening(screening);
        booking.setSeats(seatsToBook);
        booking.setCreatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        screening.setOccupiedSeats(screening.getOccupiedSeats() + seatsToBook.size());
        screeningRepository.save(screening);

        return new BookingResponseDTO(booking);
    }

    private AppUser resolveBookingUser(String username) {
        if (username != null && !username.isBlank()) {
            return appUserRepository.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        }

        return appUserRepository.findByUsername("guest")
                .orElseGet(() -> {
                    AppUser guest = new AppUser();
                    guest.setUsername("guest");
                    guest.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                    guest.setRole(Role.ROLE_USER);
                    return appUserRepository.save(guest);
                });
    }
}

