package com.example.kino.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Service
public class MoviePosterService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${omdb.base-url:https://www.omdbapi.com/}")
    private String baseUrl;

    @Value("${omdb.api-key:}")
    private String apiKey;

    public String fetchPosterUrlByTitle(String title) {
        return fetchPosterUrlByTitleAndYear(title, null);
    }

    public String fetchPosterUrlByTitleAndYear(String title, String premieredAt) {
        OmdbMovieResponse response = fetchBestMatchByTitle(title, premieredAt);
        if (response == null) return null;
        if (!"True".equalsIgnoreCase(response.Response())) {
            SearchResponse s = searchBestMatch(title, premieredAt);
            String imdbId = firstImdbId(s);
            if (imdbId != null) {
                return "/api/posters/omdb/" + imdbId;
            }
            return null;
        }

        if (response.imdbID() != null && !response.imdbID().isBlank()) {
            return "/api/posters/omdb/" + response.imdbID();
        }

        if (response.Poster() == null || "N/A".equalsIgnoreCase(response.Poster())) return null;
        return response.Poster();
    }

    public OmdbMovieResponse fetchByTitleAndYearRaw(String title, String premieredAt) {
        return fetchByTitleAndYearRaw(title, premieredAt, true);
    }

    public OmdbMovieResponse fetchByTitleAndYearRaw(String title, String premieredAt, boolean includeTypeMovie) {
        if (apiKey == null || apiKey.isBlank() || title == null || title.isBlank()) {
            return null;
        }

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("apikey", apiKey)
                .queryParam("t", title);

        if (includeTypeMovie) {
            builder = builder.queryParam("type", "movie");
        }

        Integer year = parseYear(premieredAt);
        if (year != null) {
            builder = builder.queryParam("y", year);
        }

        String url = builder.toUriString();

        try {
            return restTemplate.getForObject(url, OmdbMovieResponse.class);
        } catch (RestClientException ex) {
            return null;
        }
    }

    private OmdbMovieResponse fetchBestMatchByTitle(String title, String premieredAt) {
        OmdbMovieResponse r1 = fetchByTitleAndYearRaw(title, premieredAt, true);
        if (isOk(r1)) return r1;

        OmdbMovieResponse r2 = fetchByTitleAndYearRaw(title, null, true);
        if (isOk(r2)) return r2;

        OmdbMovieResponse r3 = fetchByTitleAndYearRaw(title, premieredAt, false);
        if (isOk(r3)) return r3;

        OmdbMovieResponse r4 = fetchByTitleAndYearRaw(title, null, false);
        if (isOk(r4)) return r4;

        return r1 != null ? r1 : (r2 != null ? r2 : (r3 != null ? r3 : r4));
    }

    private boolean isOk(OmdbMovieResponse r) {
        return r != null && "True".equalsIgnoreCase(r.Response());
    }

    private SearchResponse searchBestMatch(String title, String premieredAt) {
        SearchResponse r1 = searchRaw(title, premieredAt, true);
        if (isOk(r1)) return r1;
        SearchResponse r2 = searchRaw(title, null, true);
        if (isOk(r2)) return r2;
        SearchResponse r3 = searchRaw(title, premieredAt, false);
        if (isOk(r3)) return r3;
        return r1 != null ? r1 : (r2 != null ? r2 : r3);
    }

    private SearchResponse searchRaw(String title, String premieredAt, boolean includeTypeMovie) {
        if (apiKey == null || apiKey.isBlank() || title == null || title.isBlank()) {
            return null;
        }
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("apikey", apiKey)
                .queryParam("s", title);
        if (includeTypeMovie) {
            builder = builder.queryParam("type", "movie");
        }
        Integer year = parseYear(premieredAt);
        if (year != null) {
            builder = builder.queryParam("y", year);
        }
        String url = builder.toUriString();
        try {
            return restTemplate.getForObject(url, SearchResponse.class);
        } catch (RestClientException ex) {
            return null;
        }
    }

    private boolean isOk(SearchResponse r) {
        return r != null && "True".equalsIgnoreCase(r.Response());
    }

    private String firstImdbId(SearchResponse r) {
        if (r == null || r.Search() == null || r.Search().isEmpty()) return null;
        String imdb = r.Search().getFirst().imdbID();
        return (imdb == null || imdb.isBlank()) ? null : imdb;
    }

    private Integer parseYear(String premieredAt) {
        if (premieredAt == null) return null;
        String s = premieredAt.trim();
        if (s.length() < 4) return null;
        String y = s.substring(0, 4);
        try {
            int year = Integer.parseInt(y);
            if (year < 1878 || year > 3000) return null;
            return year;
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    public record OmdbMovieResponse(String Response, String Poster, String imdbID, String Error) {
    }

    public record SearchResponse(String Response, List<SearchItem> Search, String totalResults, String Error) {
    }

    public record SearchItem(String Title, String Year, String imdbID, String Type, String Poster) {
    }
}

