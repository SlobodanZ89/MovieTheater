package com.example.kino.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class ExternalMovieService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${omdb.base-url:https://www.omdbapi.com/}")
    private String baseUrl;

    @Value("${omdb.api-key:}")
    private String apiKey;

    public OmdbMovieDetails fetchDetailsByTitle(String title, String premieredAt) {
        if (apiKey == null || apiKey.isBlank() || title == null || title.isBlank()) {
            return null;
        }

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("apikey", apiKey)
                .queryParam("t", title)
                .queryParam("plot", "short")
                .queryParam("type", "movie");

        Integer year = parseYear(premieredAt);
        if (year != null) {
            builder = builder.queryParam("y", year);
        }

        try {
            OmdbMovieDetails details = restTemplate.getForObject(builder.toUriString(), OmdbMovieDetails.class);
            if (details == null) return null;
            if (!"True".equalsIgnoreCase(details.Response())) return null;
            return details;
        } catch (RestClientException ex) {
            return null;
        }
    }

    public String toPosterPath(OmdbMovieDetails details) {
        if (details == null) return null;
        if (details.imdbID() == null || details.imdbID().isBlank()) return null;
        return "/api/posters/omdb/" + details.imdbID();
    }

    public static Integer runtimeMinutes(String runtime) {
        if (runtime == null) return null;
        String s = runtime.trim();
        if (s.isEmpty() || "N/A".equalsIgnoreCase(s)) return null;
        int space = s.indexOf(' ');
        String num = (space > 0 ? s.substring(0, space) : s).trim();
        try {
            return Integer.parseInt(num);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private Integer parseYear(String premieredAt) {
        if (premieredAt == null) return null;
        String s = premieredAt.trim();
        if (s.length() < 4) return null;
        try {
            return Integer.parseInt(s.substring(0, 4));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public record OmdbMovieDetails(
            String Response,
            String Error,
            String imdbID,
            String Poster,
            String Genre,
            String Plot,
            String Runtime
    ) {
    }
}

