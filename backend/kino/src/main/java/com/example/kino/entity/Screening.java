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
public class Screening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int screeningId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "movieId")
    private Movie movie;

    @ManyToOne(optional = false)
    @JoinColumn(name = "hallId")
    private Hall hall;

    @Column(nullable = false)
    private LocalDateTime startTime;

    private int occupiedSeats;

    @OneToMany(mappedBy = "screening")
    private List<Booking> bookings;
}

