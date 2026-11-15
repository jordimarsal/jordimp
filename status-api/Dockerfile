# Build stage
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# Runtime stage
# digest pinned 2026-11-15 via `docker manifest inspect eclipse-temurin:25-jre` (linux/amd64)
FROM eclipse-temurin:25-jre@sha256:fa681c5833ecc085202c0923e909f9de888d80d22a7f38d6c51268ae5978c1d7
WORKDIR /app
ENV SERVER_PORT=8081
RUN groupadd -r appuser && useradd -r -g appuser appuser
COPY --from=build /app/target/*.jar app.jar
USER appuser
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
