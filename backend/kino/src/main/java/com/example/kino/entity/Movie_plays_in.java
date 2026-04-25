package com.example.kino.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@IdClass(Movie_plays_in_PK.class)
public class Movie_plays_in {

    @Id
    @ManyToOne
    @JoinColumn(name = "hallId")
    private Hall hall;

    @Id
    @ManyToOne
    @JoinColumn(name = "movieId")
    private Movie movie;
}
