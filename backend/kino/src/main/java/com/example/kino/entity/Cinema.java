package com.example.kino.entity;

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
public class Cinema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int cinemaId;

    private String name;
    private String address;
    private String manager;
    private int maxHalls;
    @Lob
    @Column(columnDefinition = "CLOB")
    private String imageUrl;

    @OneToMany(mappedBy = "cinema")
    private List<Hall> hall;
}
