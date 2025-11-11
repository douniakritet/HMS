package com.medical;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication app = new SpringApplication(AppApplication.class);
		// Définit une propriété par défaut pour le port (peut être surchargée par CLI / env vars)
		Map<String, Object> defaultProps = new HashMap<>();
		defaultProps.put("server.port", "8083");
		app.setDefaultProperties(defaultProps);

		// Définit la propriété système pour le port afin d'avoir priorité sur application.properties
		// (toujours possible d'être surchargé par un argument en ligne de commande "--server.port=..." )
		System.setProperty("server.port", "8083");

		app.run(args);
	}

}
