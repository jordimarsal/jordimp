package net.jordimp.status.web;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.jordimp.status.config.AppProperties;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class RateLimitFilter extends OncePerRequestFilter {
    
    private record Bucket(double tokens, long lastRefillTimestamp) {}

    private final AppProperties config;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(AppProperties config) {
        this.config = config;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.equals("/api/status") || 
                 path.equals("/api/status/stream") || 
                 path.equals("/api/health") ||
                 path.equals("/api/fleet")); // T26.2: Added /api/fleet to protected set
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String ip = request.getHeader("CF-Connecting-IP");
        if (ip == null) {
            ip = request.getRemoteAddr();
        }

        if (!tryAcquire(ip)) {
            sendProblemJson(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private synchronized boolean tryAcquire(String ip) {
        long now = System.currentTimeMillis();
        double refillRatePerMs = (double) config.rateLimitRequestsPerMinute() / 60_000.0;
        double capacity = config.rateLimitRequestsPerMinute();

        Bucket bucket = buckets.computeIfAbsent(ip, k -> new Bucket(capacity, now));
        
        long elapsed = now - bucket.lastRefillTimestamp();
        double newTokens = Math.min(capacity, bucket.tokens() + (elapsed * refillRatePerMs));
        
        if (newTokens >= 1.0) {
            buckets.put(ip, new Bucket(newTokens - 1.0, now));
            return true;
        } else {
            buckets.put(ip, new Bucket(newTokens, now));
            return false;
        }
    }

    private void sendProblemJson(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setContentType("application/problem+json");
        response.setHeader("Retry-After", "60");
        response.getWriter().write("""
            {
              "type": "https://api.jordimp.net/probs/rate-limit-exceeded",
              "title": "Too Many Requests",
              "status": 429,
              "detail": "Rate limit exceeded. Please try again later."
            }
            """);
    }
}
