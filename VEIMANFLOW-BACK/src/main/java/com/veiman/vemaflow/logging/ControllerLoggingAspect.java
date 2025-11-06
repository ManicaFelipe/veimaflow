package com.veiman.vemaflow.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.Signature;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ControllerLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(ControllerLoggingAspect.class);

    @Around("execution(* com.veiman.vemaflow.controller..*(..))")
    public Object logControllerCalls(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Signature sig = pjp.getSignature();
        String method = sig.getDeclaringType().getSimpleName() + "." + sig.getName();
        log.info("CONTROLLER IN {}", method);
        try {
            Object result = pjp.proceed();
            long elapsed = System.currentTimeMillis() - start;
            log.info("CONTROLLER OUT {} tookMs={}", method, elapsed);
            return result;
        } catch (Throwable ex) {
            long elapsed = System.currentTimeMillis() - start;
            log.error("CONTROLLER EX {} tookMs={} exType={} message={}", method, elapsed, ex.getClass().getSimpleName(), safeMsg(ex.getMessage()));
            throw ex;
        }
    }

    private String safeMsg(String msg) {
        if (msg == null) return "-";
        msg = msg.replaceAll("\n|\r", " ");
        return msg.length() > 200 ? msg.substring(0, 200) + "…" : msg;
    }
}
