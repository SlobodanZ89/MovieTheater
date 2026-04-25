package com.example.kino.config;

import com.example.kino.entity.*;
import com.example.kino.enums.MovieVersion;
import com.example.kino.enums.Role;
import com.example.kino.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CinemaRepository cinemaRepository;
    private final HallRepository hallRepository;
    private final MovieRepository movieRepository;
    private final Movie_plays_inRepository moviePlaysInRepository;
    private final ScreeningRepository screeningRepository;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!appUserRepository.existsByUsername("admin")) {
            AppUser admin = new AppUser();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin"));
            admin.setRole(Role.ROLE_ADMIN);
            appUserRepository.save(admin);
        }

        if (!appUserRepository.existsByUsername("user")) {
            AppUser user = new AppUser();
            user.setUsername("user");
            user.setPasswordHash(passwordEncoder.encode("user"));
            user.setRole(Role.ROLE_USER);
            appUserRepository.save(user);
        }

        if (movieRepository.count() > 0 || cinemaRepository.count() > 0) {
            return;
        }

        Cinema cityCinema = new Cinema();
        cityCinema.setName("City Cinema");
        cityCinema.setAddress("Hauptstraße 1, 1010 Wien");
        cityCinema.setManager("Max Muster");
        cityCinema.setMaxHalls(5);
        cityCinema.setImageUrl("https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=1600&q=80");
        cinemaRepository.save(cityCinema);

        Cinema riverCineplex = new Cinema();
        riverCineplex.setName("River Cineplex");
        riverCineplex.setAddress("Donaupromenade 7, 1020 Wien");
        riverCineplex.setManager("Erika Beispiel");
        riverCineplex.setMaxHalls(6);
        riverCineplex.setImageUrl("https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=80");
        cinemaRepository.save(riverCineplex);

        Hall hall2d = new Hall();
        hall2d.setCinema(cityCinema);
        hall2d.setName("Hall 1");
        hall2d.setRows(8);
        hall2d.setCols(12);
        hall2d.setLayoutRows(List.of(
                "111111111111",
                "111111111111",
                "111110011111",
                "111110011111",
                "111110011111",
                "111111111111",
                "011111111110",
                "001111111100"
        ));
        hall2d.setSupportedMovieVersion(MovieVersion.D2D);
        hallRepository.save(hall2d);

        Hall hall3d = new Hall();
        hall3d.setCinema(cityCinema);
        hall3d.setName("Hall 2");
        hall3d.setRows(7);
        hall3d.setCols(12);
        hall3d.setLayoutRows(List.of(
                "111111111111",
                "111110011111",
                "111110011111",
                "111111111111",
                "111110011111",
                "011111111110",
                "001111111100"
        ));
        hall3d.setSupportedMovieVersion(MovieVersion.R3D);
        hallRepository.save(hall3d);

        Hall hallDbox = new Hall();
        hallDbox.setCinema(riverCineplex);
        hallDbox.setName("Hall 3");
        hallDbox.setRows(6);
        hallDbox.setCols(10);
        hallDbox.setLayoutRows(List.of(
                "1111111111",
                "1111101111",
                "1111101111",
                "1111111111",
                "0111111110",
                "0011111100"
        ));
        hallDbox.setSupportedMovieVersion(MovieVersion.DBOX);
        hallRepository.save(hallDbox);

        Movie movie2d = new Movie();
        movie2d.setTitle("The Dark Knight");
        movie2d.setMainCharacter("Bruce Wayne");
        movie2d.setDescription("Batman faces the Joker in Gotham City.");
        movie2d.setPremieredAt("2008");
        movie2d.setMovieVersion(MovieVersion.D2D);
        movie2d.setPosterUrl("/api/posters/omdb/tt0468569");
        movieRepository.save(movie2d);

        Movie movie3d = new Movie();
        movie3d.setTitle("Avatar");
        movie3d.setMainCharacter("Jake Sully");
        movie3d.setDescription("A marine on an alien planet becomes torn between two worlds.");
        movie3d.setPremieredAt("2009");
        movie3d.setMovieVersion(MovieVersion.R3D);
        movie3d.setPosterUrl("/api/posters/omdb/tt0499549");
        movieRepository.save(movie3d);

        Movie movieDbox = new Movie();
        movieDbox.setTitle("Top Gun: Maverick");
        movieDbox.setMainCharacter("Pete 'Maverick' Mitchell");
        movieDbox.setDescription("Maverick returns to train a new generation of pilots.");
        movieDbox.setPremieredAt("2022");
        movieDbox.setMovieVersion(MovieVersion.DBOX);
        movieDbox.setPosterUrl("/api/posters/omdb/tt1745960");
        movieRepository.save(movieDbox);

        moviePlaysInRepository.save(new Movie_plays_in(hall2d, movie2d));
        moviePlaysInRepository.save(new Movie_plays_in(hall3d, movie3d));
        moviePlaysInRepository.save(new Movie_plays_in(hallDbox, movieDbox));

        // More movies for a nicer demo (posters are served via backend OMDb proxy)
        Movie m4 = new Movie();
        m4.setTitle("Inception");
        m4.setMainCharacter("Dom Cobb");
        m4.setDescription("A thief enters dreams to steal secrets — and is offered a chance at redemption.");
        m4.setPremieredAt("2010");
        m4.setMovieVersion(MovieVersion.R3D);
        m4.setPosterUrl("/api/posters/omdb/tt1375666");
        movieRepository.save(m4);

        Movie m5 = new Movie();
        m5.setTitle("Interstellar");
        m5.setMainCharacter("Cooper");
        m5.setDescription("A team travels through a wormhole in search of humanity's new home.");
        m5.setPremieredAt("2014");
        m5.setMovieVersion(MovieVersion.D2D);
        m5.setPosterUrl("/api/posters/omdb/tt0816692");
        movieRepository.save(m5);

        Movie m6 = new Movie();
        m6.setTitle("The Matrix");
        m6.setMainCharacter("Neo");
        m6.setDescription("A hacker discovers the shocking truth about reality.");
        m6.setPremieredAt("1999");
        m6.setMovieVersion(MovieVersion.R3D);
        m6.setPosterUrl("/api/posters/omdb/tt0133093");
        movieRepository.save(m6);

        Movie m7 = new Movie();
        m7.setTitle("Dune");
        m7.setMainCharacter("Paul Atreides");
        m7.setDescription("A noble family becomes embroiled in a war for control of a desert planet.");
        m7.setPremieredAt("2021");
        m7.setMovieVersion(MovieVersion.D2D);
        m7.setPosterUrl("/api/posters/omdb/tt1160419");
        movieRepository.save(m7);

        Movie m8 = new Movie();
        m8.setTitle("Spider-Man: No Way Home");
        m8.setMainCharacter("Peter Parker");
        m8.setDescription("Peter seeks help from Doctor Strange when his identity is revealed.");
        m8.setPremieredAt("2021");
        m8.setMovieVersion(MovieVersion.DBOX);
        m8.setPosterUrl("/api/posters/omdb/tt10872600");
        movieRepository.save(m8);

        Movie m9 = new Movie();
        m9.setTitle("Oppenheimer");
        m9.setMainCharacter("J. Robert Oppenheimer");
        m9.setDescription("The story of the development of the atomic bomb during World War II.");
        m9.setPremieredAt("2023");
        m9.setMovieVersion(MovieVersion.D2D);
        m9.setPosterUrl("/api/posters/omdb/tt15398776");
        movieRepository.save(m9);

        Movie m10 = new Movie();
        m10.setTitle("Barbie");
        m10.setMainCharacter("Barbie");
        m10.setDescription("Barbie leaves Barbieland to find the meaning of life.");
        m10.setPremieredAt("2023");
        m10.setMovieVersion(MovieVersion.D2D);
        m10.setPosterUrl("/api/posters/omdb/tt1517268");
        movieRepository.save(m10);

        Movie m11 = new Movie();
        m11.setTitle("Guardians of the Galaxy");
        m11.setMainCharacter("Peter Quill");
        m11.setDescription("A group of intergalactic criminals must pull together to stop a fanatical warrior.");
        m11.setPremieredAt("2014");
        m11.setMovieVersion(MovieVersion.DBOX);
        m11.setPosterUrl("/api/posters/omdb/tt2015381");
        movieRepository.save(m11);

        Movie m12 = new Movie();
        m12.setTitle("Joker");
        m12.setMainCharacter("Arthur Fleck");
        m12.setDescription("A failed comedian's descent into madness and chaos.");
        m12.setPremieredAt("2019");
        m12.setMovieVersion(MovieVersion.R3D);
        m12.setPosterUrl("/api/posters/omdb/tt7286456");
        movieRepository.save(m12);

        Movie m13 = new Movie();
        m13.setTitle("John Wick");
        m13.setMainCharacter("John Wick");
        m13.setDescription("An ex-hitman comes out of retirement to track down the gangsters that took everything.");
        m13.setPremieredAt("2014");
        m13.setMovieVersion(MovieVersion.D2D);
        m13.setPosterUrl("/api/posters/omdb/tt2911666");
        movieRepository.save(m13);

        Movie m14 = new Movie();
        m14.setTitle("Mad Max: Fury Road");
        m14.setMainCharacter("Max Rockatansky");
        m14.setDescription("In a post-apocalyptic wasteland, Max teams up with Furiosa to escape a tyrant.");
        m14.setPremieredAt("2015");
        m14.setMovieVersion(MovieVersion.DBOX);
        m14.setPosterUrl("/api/posters/omdb/tt1392190");
        movieRepository.save(m14);

        Movie m15 = new Movie();
        m15.setTitle("The Lord of the Rings: The Fellowship of the Ring");
        m15.setMainCharacter("Frodo Baggins");
        m15.setDescription("A meek Hobbit and eight companions set out on a journey to destroy the One Ring.");
        m15.setPremieredAt("2001");
        m15.setMovieVersion(MovieVersion.D2D);
        m15.setPosterUrl("/api/posters/omdb/tt0120737");
        movieRepository.save(m15);

        Movie m16 = new Movie();
        m16.setTitle("Star Wars: Episode IV - A New Hope");
        m16.setMainCharacter("Luke Skywalker");
        m16.setDescription("Luke joins forces to save Princess Leia and fight the evil Empire.");
        m16.setPremieredAt("1977");
        m16.setMovieVersion(MovieVersion.D2D);
        m16.setPosterUrl("/api/posters/omdb/tt0076759");
        movieRepository.save(m16);

        Movie m17 = new Movie();
        m17.setTitle("The Avengers");
        m17.setMainCharacter("Tony Stark");
        m17.setDescription("Earth's mightiest heroes must come together to stop a global threat.");
        m17.setPremieredAt("2012");
        m17.setMovieVersion(MovieVersion.R3D);
        m17.setPosterUrl("/api/posters/omdb/tt0848228");
        movieRepository.save(m17);

        Movie m18 = new Movie();
        m18.setTitle("Gladiator");
        m18.setMainCharacter("Maximus");
        m18.setDescription("A former Roman General seeks revenge after being betrayed.");
        m18.setPremieredAt("2000");
        m18.setMovieVersion(MovieVersion.D2D);
        m18.setPosterUrl("/api/posters/omdb/tt0172495");
        movieRepository.save(m18);

        // Link movies to halls (simple demo: allow all movies to play in all halls)
        List<Movie> allMovies = List.of(
                movie2d, movie3d, movieDbox,
                m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18
        );
        List<Hall> halls = List.of(hall2d, hall3d, hallDbox);
        for (Hall h : halls) {
            for (Movie m : allMovies) {
                moviePlaysInRepository.save(new Movie_plays_in(h, m));
            }
        }

        // Screenings: multiple times for many movies on "tomorrow" and the day after
        LocalDateTime base = LocalDateTime.now().plusDays(1).withSecond(0).withNano(0);
        List<LocalTime> slots = List.of(LocalTime.of(14, 0), LocalTime.of(17, 30), LocalTime.of(20, 30));

        int i = 0;
        for (Movie m : allMovies) {
            Hall h = halls.get(i % halls.size());
            for (LocalTime t : slots) {
                Screening s = new Screening();
                s.setMovie(m);
                s.setHall(h);
                s.setStartTime(base.withHour(t.getHour()).withMinute(t.getMinute()));
                s.setOccupiedSeats(0);
                screeningRepository.save(s);
            }
            // extra late show for every 3rd movie, day after tomorrow
            if (i % 3 == 0) {
                Screening late = new Screening();
                late.setMovie(m);
                late.setHall(halls.get((i + 1) % halls.size()));
                late.setStartTime(base.plusDays(1).withHour(22).withMinute(0));
                late.setOccupiedSeats(0);
                screeningRepository.save(late);
            }
            i++;
        }
    }
}

