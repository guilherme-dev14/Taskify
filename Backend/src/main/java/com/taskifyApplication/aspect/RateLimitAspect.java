package com.taskifyApplication.aspect;

import com.taskifyApplication.annotation.RateLimit;
import com.taskifyApplication.exception.TooManyRequestsException;
import com.taskifyApplication.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Aspect
@Component
public class RateLimitAspect {

    @Autowired
    private JwtService jwtService;

    // Simple in-memory rate limiting storage
    private final ConcurrentHashMap<String, RateLimitInfo> rateLimitStore = new ConcurrentHashMap<>();

    @Around("@annotation(rateLimit)")
    public Object checkRateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String key = generateKey(joinPoint, rateLimit);

        if (isRateLimited(key, rateLimit)) {
            throw new TooManyRequestsException("Rate limit exceeded. Try again later.");
        }

        return joinPoint.proceed();
    }

    private String generateKey(ProceedingJoinPoint joinPoint, RateLimit rateLimit) {
        StringBuilder keyBuilder = new StringBuilder();

        // Add prefix
        if (!rateLimit.keyPrefix().isEmpty()) {
            keyBuilder.append(rateLimit.keyPrefix());
        } else {
            keyBuilder.append(joinPoint.getSignature().getName());
        }

        // Add user identifier if per-user rate limiting is enabled
        if (rateLimit.perUser()) {
            String userIdentifier = getUserIdentifier();
            if (userIdentifier != null) {
                keyBuilder.append(":").append(userIdentifier);
            } else {
                // Fallback to IP address if no user identifier
                String ipAddress = getClientIpAddress();
                keyBuilder.append(":").append(ipAddress);
            }
        }

        return keyBuilder.toString();
    }

    private boolean isRateLimited(String key, RateLimit rateLimit) {
        long currentTime = System.currentTimeMillis();
        long timeWindowMs = rateLimit.timeWindow() * 1000L;

        rateLimitStore.compute(key, (k, info) -> {
            if (info == null || currentTime - info.getWindowStart() > timeWindowMs) {
                // New window or expired window
                return new RateLimitInfo(currentTime, new AtomicInteger(1));
            } else {
                // Within current window
                info.getCount().incrementAndGet();
                return info;
            }
        });

        RateLimitInfo info = rateLimitStore.get(key);
        return info != null && info.getCount().get() > rateLimit.requests();
    }

    private String getUserIdentifier() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String authorizationHeader = request.getHeader("Authorization");

                if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                    String token = authorizationHeader.substring(7);
                    return jwtService.extractUsername(token);
                }
            }
        } catch (Exception e) {
            // Log error and fall back to IP-based rate limiting
            System.err.println("Error extracting user identifier for rate limiting: " + e.getMessage());
        }
        return null;
    }

    private String getClientIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();

                // Check for forwarded headers first
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }

                String xRealIp = request.getHeader("X-Real-IP");
                if (xRealIp != null && !xRealIp.isEmpty()) {
                    return xRealIp;
                }

                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            System.err.println("Error extracting client IP address: " + e.getMessage());
        }
        return "unknown";
    }

    // Cleanup method to remove expired entries (should be called periodically)
    public void cleanupExpiredEntries() {
        long currentTime = System.currentTimeMillis();
        rateLimitStore.entrySet().removeIf(entry ->
            currentTime - entry.getValue().getWindowStart() > 3600000 // Remove entries older than 1 hour
        );
    }

    private static class RateLimitInfo {
        private final long windowStart;
        private final AtomicInteger count;

        public RateLimitInfo(long windowStart, AtomicInteger count) {
            this.windowStart = windowStart;
            this.count = count;
        }

        public long getWindowStart() {
            return windowStart;
        }

        public AtomicInteger getCount() {
            return count;
        }
    }
}