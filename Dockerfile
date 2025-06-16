FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

COPY build/libs/LeagueTracker-0.0.1-SNAPSHOT.jar app.jar
COPY application-secrets.properties application-secrets.properties

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
