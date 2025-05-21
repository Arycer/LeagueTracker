# Imagen base con Java 21
FROM eclipse-temurin:21-jdk-jammy

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el JAR construido al contenedor (ajusta el nombre)
COPY build/libs/LeagueTracker-0.0.1-SNAPSHOT.jar app.jar
COPY application-secrets.properties application-secrets.properties

# Exponemos el puerto 8080 (el que uses en tu app)
EXPOSE 8080

# Comando para ejecutar el JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
