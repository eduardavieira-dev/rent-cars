FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY server/pom.xml ./pom.xml
RUN mvn -B dependency:go-offline -q

COPY server/src ./src
RUN mvn -B package -DskipTests -q

FROM eclipse-temurin:21-jre-jammy AS runtime

WORKDIR /app

RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

COPY --from=build /app/target/*.jar app.jar

RUN chown appuser:appgroup app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
