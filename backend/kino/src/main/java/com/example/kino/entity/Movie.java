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
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int movieId;

    private String title;
    private String mainCharacter;
    private String description;
    private String premieredAt;

    @Enumerated(EnumType.STRING)
    private MovieVersion movieVersion;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String posterUrl;

    private String genre;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String plot;

    private Integer runtimeMinutes;

    @ManyToOne
    @JoinColumn(name = "hallId")
    private Hall hall;

    @OneToMany(mappedBy = "movie")
    private List<Movie_plays_in> moviePlaysInList;
}
