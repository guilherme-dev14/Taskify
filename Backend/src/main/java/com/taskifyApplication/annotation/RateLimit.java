package com.taskifyApplication.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {

    /**
     * Number of requests allowed per time window
     */
    int requests() default 10;

    /**
     * Time window in seconds
     */
    int timeWindow() default 60;

    /**
     * Rate limit key prefix. If not specified, uses the method name.
     */
    String keyPrefix() default "";

    /**
     * Whether to use user-specific rate limiting
     */
    boolean perUser() default true;
}