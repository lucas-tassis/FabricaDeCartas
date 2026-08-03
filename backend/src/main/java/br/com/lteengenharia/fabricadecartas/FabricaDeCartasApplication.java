package br.com.lteengenharia.fabricadecartas;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import java.awt.Desktop;
import java.net.URI;

@SpringBootApplication
public class FabricaDeCartasApplication {

	@Value("${server.port:8080}")
	private int port;

	public static void main(String[] args) {
		// Set headless to false so AWT Desktop can be used to open system browser
		System.setProperty("java.awt.headless", "false");
		SpringApplication.run(FabricaDeCartasApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void openBrowserOnStartup() {
		try {
			if (Desktop.isDesktopSupported()) {
				Desktop desktop = Desktop.getDesktop();
				if (desktop.isSupported(Desktop.Action.BROWSE)) {
					desktop.browse(new URI("http://localhost:" + port));
				}
			}
		} catch (Exception e) {
			System.err.println("Could not open system browser automatically: " + e.getMessage());
		}
	}
}

