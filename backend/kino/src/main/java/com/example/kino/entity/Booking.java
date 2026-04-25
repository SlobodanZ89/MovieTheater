package com.example.kino.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int bookingId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "userId")
    private AppUser user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "screeningId")
    private Screening screening;

    @ElementCollection
    @CollectionTable(name = "booking_seat", joinColumns = @JoinColumn(name = "bookingId"))
    private List<SeatCoordinate> seats;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}

