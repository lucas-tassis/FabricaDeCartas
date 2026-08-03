package br.com.lteengenharia.fabricadecartas;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import java.awt.Desktop;
import java.awt.GraphicsEnvironment;
import java.net.URI;

@SpringBootApplication
public class FabricaDeCartasApplication {

	@Value("${server.port:8081}")
	private int port;

	public static void main(String[] args) {
		SpringApplication.run(FabricaDeCartasApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void openBrowserOnStartup() {
		try {
			if (!GraphicsEnvironment.isHeadless() && Desktop.isDesktopSupported()) {
				Desktop desktop = Desktop.getDesktop();
				if (desktop.isSupported(Desktop.Action.BROWSE)) {
					desktop.browse(new URI("http://localhost:" + port));
				}
			}
		} catch (Throwable t) {
			System.out.println("Servidor em modo headless (cloud) — navegação automática omitida: " + t.getMessage());
		}
	}
}

