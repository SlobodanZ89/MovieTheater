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
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/posters")
public class PosterProxyController {

    private final RestTemplate restTemplate;

    @Value("${omdb.base-url:https://www.omdbapi.com/}")
    private String omdbBaseUrl;

    public PosterProxyController() {
        // Avoid hanging image loads in the UI if OMDb/CDNs are slow/unreachable.
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(4000);
        f.setReadTimeout(8000);
        this.restTemplate = new RestTemplate(f);
    }

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
            return placeholderPoster();
        }
        if (!StringUtils.hasText(omdbApiKey)) {
            return placeholderPoster();
        }

        // Avoid calling img.omdbapi.com directly: it can be blocked/hang in some networks.
        // Instead, fetch the Poster URL from the OMDb data API and proxy that image URL.
        String posterUrl = fetchPosterUrlFromDataApi(imdbId.trim());
        if (!StringUtils.hasText(posterUrl)) {
            return placeholderPoster();
        }
        return proxy(posterUrl);
    }

    @GetMapping("/omdb-status")
    public Map<String, Object> omdbStatus() {
        boolean hasKey = StringUtils.hasText(omdbApiKey);
        return Map.of(
                "hasKey", hasKey,
                "keyLength", hasKey ? omdbApiKey.trim().length() : 0
        );
    }

    private ResponseEntity<byte[]> placeholderPoster() {
        // Keep UI clean even when OMDb isn't configured.
        String svg = """
                <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
                  <rect fill="#1a1d24" width="600" height="900"/>
                  <text x="50%" y="48%" fill="#8b96a8" font-family="system-ui,sans-serif" font-size="28" text-anchor="middle">No poster</text>
                </svg>
                """;
        byte[] bytes = svg.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic());
        headers.setContentType(MediaType.valueOf("image/svg+xml"));
        headers.set("Cross-Origin-Resource-Policy", "cross-origin");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    private String fetchPosterUrlFromDataApi(String imdbId) {
        if (!StringUtils.hasText(imdbId) || !StringUtils.hasText(omdbApiKey)) return null;

        String url = UriComponentsBuilder.fromHttpUrl(omdbBaseUrl)
                .queryParam("apikey", omdbApiKey.trim())
                .queryParam("i", imdbId.trim())
                .queryParam("plot", "short")
                .toUriString();

        try {
            OmdbByIdResponse r = restTemplate.getForObject(url, OmdbByIdResponse.class);
            if (r == null) return null;
            if (!"True".equalsIgnoreCase(r.Response())) return null;
            if (!StringUtils.hasText(r.Poster()) || "N/A".equalsIgnoreCase(r.Poster())) return null;
            return r.Poster().trim();
        } catch (RestClientException ex) {
            return null;
        }
    }

    public record OmdbByIdResponse(String Response, String Poster, String Error) {
    }
}

