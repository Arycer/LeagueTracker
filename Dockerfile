# Etapa 1: build del JAR
FROM gradle:8.7-jdk21 AS build
COPY --chown=gradle:gradle . /home/gradle/project
WORKDIR /home/gradle/project
RUN ./gradlew clean build -x test

# Etapa 2: imagen final con JAR ya construido
FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY --from=build /home/gradle/project/build/libs/*.jar app.jar
COPY application-secrets.properties application-secrets.properties
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
