package com.example.kino.repositories;

import com.example.kino.entity.Booking;
import com.example.kino.entity.Screening;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByScreening(Screening screening);
}

