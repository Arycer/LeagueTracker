package me.arycer.leaguetracker.config

import java.io.FileInputStream
import java.io.IOException
import java.util.*

object ApiKeyLoader {
    private const val API_KEY_FILE = "application-secrets.properties"
    private var cachedApiKey: String? = null

    val apiKey: String
        get() {
            if (cachedApiKey != null) {
                return cachedApiKey!!
            }

            val properties = Properties()
            try {
                FileInputStream(API_KEY_FILE).use { input ->
                    properties.load(input)
                    cachedApiKey = properties.getProperty("riot.api.key")

                    if (cachedApiKey == null || cachedApiKey!!.isEmpty()) {
                        throw RuntimeException("La API Key no está configurada en el archivo: " + API_KEY_FILE)
                    }
                    return cachedApiKey!!
                }
            } catch (e: IOException) {
                throw RuntimeException(
                    "Error al cargar el archivo de configuración: " + API_KEY_FILE,
                    e
                )
            }
        }
}