package com.medical.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.context.WebServerInitializedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class StartupLogger implements ApplicationListener<WebServerInitializedEvent> {

    private static final Logger log = LoggerFactory.getLogger(StartupLogger.class);

    private final Environment env;

    public StartupLogger(Environment env) {
        this.env = env;
    }

    @Override
    public void onApplicationEvent(WebServerInitializedEvent event) {
        int port = event.getWebServer().getPort();
        String serverPortProp = env.getProperty("server.port");
        String systemProp = System.getProperty("server.port");
        String envVar = System.getenv("SERVER_PORT");
        String activeProfiles = Arrays.toString(env.getActiveProfiles());

        log.info("Application started on port: {}", port);
        log.info("Environment property server.port={}", serverPortProp);
        log.info("System property server.port={}", systemProp);
        log.info("Environment variable SERVER_PORT={}", envVar);
        log.info("Active Spring profiles={}", activeProfiles);
    }
}

