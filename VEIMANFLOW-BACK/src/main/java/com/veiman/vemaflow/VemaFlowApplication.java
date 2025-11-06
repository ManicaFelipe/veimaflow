package com.veiman.vemaflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VemaFlowApplication {

	public static void main(String[] args) {
		SpringApplication.run(VemaFlowApplication.class, args);
	}

}
