package com.example.kino.controller;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Duration;

@RestController
@RequestMapping("/api/posters")
public class PosterProxyController {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${omdb.api-key:}")
    private String omdbApiKey;

    @GetMapping("/proxy")
    public ResponseEntity<byte[]> proxy(@RequestParam("url") String url) {
        if (!StringUtils.hasText(url)) {
            return ResponseEntity.badRequest().build();
        }

        URI uri;
        try {
            uri = URI.create(url.trim());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }

        String scheme = uri.getScheme();
        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        ResponseEntity<byte[]> upstream;
        try {
            RequestEntity<Void> req = RequestEntity
                    .method(HttpMethod.GET, uri)
                    .header(HttpHeaders.ACCEPT, "image/avif,image/webp,image/apng,image/*,*/*;q=0.8")
                    .header(HttpHeaders.USER_AGENT, "Mozilla/5.0")
                    .build();
            upstream = restTemplate.exchange(req, byte[].class);
        } catch (HttpStatusCodeException ex) {
            return ResponseEntity.status(ex.getStatusCode()).build();
        } catch (RestClientException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        HttpStatusCode upstreamStatus = upstream.getStatusCode();
        if (!upstreamStatus.is2xxSuccessful()) {
            return ResponseEntity.status(upstreamStatus).build();
        }

        byte[] bytes = upstream.getBody();
        if (bytes == null || bytes.length == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl(CacheControl.maxAge(Duration.ofHours(24)).cachePublic());
        MediaType contentType = upstream.getHeaders().getContentType();
        MediaType resolved = contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM;
        if (!resolved.getType().equalsIgnoreCase("image")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        headers.setContentType(resolved);
        headers.set("Cross-Origin-Resource-Policy", "cross-origin");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    @GetMapping("/omdb/{imdbId}")
    public ResponseEntity<byte[]> omdbPoster(@PathVariable String imdbId) {
        if (!StringUtils.hasText(imdbId) || !imdbId.trim().startsWith("tt")) {
            return ResponseEntity.badRequest().build();
        }
        if (!StringUtils.hasText(omdbApiKey)) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }

        String url = UriComponentsBuilder.fromHttpUrl("https://img.omdbapi.com/")
                .queryParam("i", imdbId.trim())
                .queryParam("apikey", omdbApiKey)
                .toUriString();

        return proxy(url);
    }
}

