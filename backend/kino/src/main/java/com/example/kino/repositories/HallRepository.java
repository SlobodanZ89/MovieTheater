package com.example.kino.repositories;

import com.example.kino.entity.Hall;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HallRepository extends JpaRepository<Hall, Integer> {
}
