# Build-context is de repo-root (zie deploy.sh: `-f Dockerfile ..` vanuit
# backend/) i.p.v. enkel backend/ - nodig om ook frontend/ mee te bouwen
# (issue #74, same-origin serving), die als sibling-map buiten backend/ ligt en
# dus anders niet bereikbaar is voor COPY.

# --- Backend builder --------------------------------------------------------
# Compileert de Rust-binary. Aparte laag voor Cargo.toml/Cargo.lock zodat
# dependencies gecached blijven zolang die twee bestanden niet veranderen.
FROM rust:1-bookworm AS backend-builder
WORKDIR /app

COPY backend/Cargo.toml backend/Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

COPY backend/src ./src
# Zorgt dat cargo de echte main.rs opnieuw compileert i.p.v. de cache van de dummy build.
RUN touch src/main.rs
RUN cargo build --release

# --- Frontend builder --------------------------------------------------------
# Bouwt de React-app naar statische bestanden (issue #74) - de backend serveert
# die zelf (zie main.rs), geen aparte host zoals Firebase Hosting (zie README
# "Tech stack" voor de afweging: same-origin nodig voor Identity-Aware Proxy).
# .env.production (in frontend/, wél gecommit) zorgt dat de gebouwde app een
# lege/relatieve API-basis-URL gebruikt, want same-origin.
FROM node:22-bookworm-slim AS frontend-builder
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# --- Runtime --------------------------------------------------------------
# Klein image: geen Rust-toolchain of Node nodig, enkel de gecompileerde
# binary + de gebouwde frontend + wat resvg nodig heeft om tekst te renderen
# (fonts) en HTTPS-calls te doen (ca-certificates, voor de Sheets API).
FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update \
    && apt-get install --no-install-recommends -y \
        ca-certificates \
        fonts-liberation \
        fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY --from=backend-builder /app/target/release/Confessor ./Confessor
COPY backend/templates ./templates
COPY --from=frontend-builder /app/dist ./dist

# Cloud Run geeft de effectieve poort door via de PORT-omgevingsvariabele
# (zie config.rs); deze EXPOSE is enkel documentatie voor lokaal draaien.
EXPOSE 8080

CMD ["./Confessor"]
