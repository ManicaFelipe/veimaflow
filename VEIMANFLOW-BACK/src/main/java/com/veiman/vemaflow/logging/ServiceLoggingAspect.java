package com.veiman.vemaflow.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;

@Aspect
@Component
public class ServiceLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(ServiceLoggingAspect.class);

    @Around("execution(* com.veiman.vemaflow.service..*(..))")
    public Object logServiceCalls(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Signature sig = pjp.getSignature();
        String method = sig.getDeclaringType().getSimpleName() + "." + sig.getName();
        String args = summarizeArgs(pjp.getArgs());

    log.info("SERVICE IN {} args={}", method, args);
        try {
            Object result = pjp.proceed();
            long elapsed = System.currentTimeMillis() - start;
            String out = summarizeResult(result);
            log.info("SERVICE OUT {} tookMs={} result={}", method, elapsed, out);
            return result;
        } catch (Throwable ex) {
            long elapsed = System.currentTimeMillis() - start;
            log.error("SERVICE EX {} tookMs={} exType={} message={}", method, elapsed, ex.getClass().getSimpleName(), safeMsg(ex.getMessage()));
            throw ex;
        }
    }

    private String summarizeArgs(Object[] args) {
        if (args == null || args.length == 0) return "-";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < args.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(summarizeValue(args[i]));
        }
        String s = sb.toString();
        return s.length() > 300 ? s.substring(0, 300) + "…" : s;
    }

    private String summarizeResult(Object result) {
        if (result == null) return "null";
        return summarizeValue(result);
    }

    private String summarizeValue(Object v) {
        if (v == null) return "null";
        if (v instanceof CharSequence cs) {
            String s = cs.toString();
            s = maskSecrets(s);
            return quote(truncate(s, 120));
        }
        if (v instanceof Number || v instanceof Boolean) {
            return v.toString();
        }
        if (v instanceof Collection<?> col) {
            return "Collection[size=" + col.size() + "]";
        }
        if (v instanceof Map<?,?> map) {
            return "Map[size=" + map.size() + "]";
        }
        // Avoid deep toString on entities/DTOs
        return v.getClass().getSimpleName();
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() > max ? s.substring(0, max) + "…" : s;
    }

    private String quote(String s) {
        return '"' + s + '"';
    }

    private String maskSecrets(String s) {
        if (s == null) return null;
        // Basic masking for common secret words
        return s
                .replaceAll("(?i)(authorization:?)\\s*([^,} ]+)", "authorization: ***")
                .replaceAll("(?i)(token|senha|password)=([^&\n ]+)", "$1=***");
    }

    private String safeMsg(String msg) {
        if (msg == null) return "-";
        msg = msg.replaceAll("\n|\r", " ");
        return truncate(msg, 200);
    }
}
