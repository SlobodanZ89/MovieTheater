package com.example.kino.controller;

import com.example.kino.DTO.request.BookingRequestDTO;
import com.example.kino.DTO.response.BookingResponseDTO;
import com.example.kino.services.BookingService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@AllArgsConstructor
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public BookingResponseDTO create(@RequestBody BookingRequestDTO request, Principal principal) {
        return bookingService.createBooking(principal.getName(), request);
    }
}

