package com.veiman.vemaflow.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String traceId = UUID.randomUUID().toString();
        MDC.put("traceId", traceId);
        long start = System.currentTimeMillis();

        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String pathWithQuery = query == null ? uri : uri + "?" + query;
        String ip = request.getRemoteAddr();
        String ua = sanitizeUserAgent(request.getHeader("User-Agent"));
        String user = getAuthenticatedUser();

    response.setHeader("X-Trace-Id", traceId);
    log.info("REQ IN method={} path={} user={} ip={} ua={} traceId={}", method, pathWithQuery, user, ip, ua, traceId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            long elapsed = System.currentTimeMillis() - start;
            int status = response.getStatus();
            log.info("REQ OUT status={} durationMs={} method={} path={} user={} traceId={}", status, elapsed, method, pathWithQuery, user, traceId);
            MDC.clear();
        }
    }

    private String getAuthenticatedUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() != null) {
                return String.valueOf(auth.getName());
            }
        } catch (Exception ignored) {}
        return "anon";
    }

    private String sanitizeUserAgent(String ua) {
        if (ua == null) return "-";
        ua = ua.replaceAll("\n|\r", " ");
        if (ua.length() > 180) {
            return ua.substring(0, 180) + "…";
        }
        return ua;
    }
}
