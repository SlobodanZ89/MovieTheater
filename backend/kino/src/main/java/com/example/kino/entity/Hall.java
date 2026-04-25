package com.example.kino.entity;

import com.example.kino.enums.MovieVersion;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int hallId;

    private String name;

    private int rows;
    private int cols;

    @ElementCollection
    @CollectionTable(name = "hall_layout_row", joinColumns = @JoinColumn(name = "hallId"))
    @Column(name = "row_pattern", nullable = false, length = 512)
    @OrderColumn(name = "row_idx")
    private List<String> layoutRows;

    @Enumerated(EnumType.STRING)
    private MovieVersion supportedMovieVersion;

    @ManyToOne
    @JoinColumn(name = "cinemaId")
    private Cinema cinema;

    @OneToMany(mappedBy = "hall")
    private List<Movie_plays_in> moviePlaysInList;

    @OneToMany(mappedBy = "hall")
    private List<Movie> movies;
}
