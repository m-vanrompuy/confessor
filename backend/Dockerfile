# --- Builder ------------------------------------------------------------
# Compileert de Rust-binary. Aparte laag voor Cargo.toml/Cargo.lock zodat
# dependencies gecached blijven zolang die twee bestanden niet veranderen.
FROM rust:1-bookworm AS builder
WORKDIR /app

COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

COPY src ./src
# Zorgt dat cargo de echte main.rs opnieuw compileert i.p.v. de cache van de dummy build.
RUN touch src/main.rs
RUN cargo build --release

# --- Runtime --------------------------------------------------------------
# Klein image: geen Rust-toolchain nodig, enkel de gecompileerde binary +
# wat resvg nodig heeft om tekst te renderen (fonts) en HTTPS-calls te doen
# (ca-certificates, voor de Sheets API).
FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        ca-certificates \
        fonts-liberation \
        fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/Confessor ./Confessor
COPY templates ./templates

# Cloud Run geeft de effectieve poort door via de PORT-omgevingsvariabele
# (zie config.rs); deze EXPOSE is enkel documentatie voor lokaal draaien.
EXPOSE 8080

CMD ["./Confessor"]
