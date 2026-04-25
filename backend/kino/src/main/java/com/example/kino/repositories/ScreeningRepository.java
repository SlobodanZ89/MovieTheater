package com.example.kino.repositories;

import com.example.kino.entity.Hall;
import com.example.kino.entity.Screening;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScreeningRepository extends JpaRepository<Screening, Integer> {
    long countByHall_Cinema_CinemaId(int cinemaId);
    List<Screening> findByHall(Hall hall);
}

