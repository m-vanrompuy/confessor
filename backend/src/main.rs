use axum::Router;
use axum::http::HeaderValue;
use axum::http::Method;
use axum::http::header::CONTENT_TYPE;
use axum::routing::get;
use axum::routing::post;
use axum::routing::put;
use rustls::crypto::ring;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

mod business;
mod config;
mod model;
mod routes;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Laadt .env lokaal in als omgevingsvariabelen; op Cloud Run bestaat dat
    // bestand niet en doet dit dus niets (vandaar .ok() i.p.v. een crash).
    dotenvy::dotenv().ok();

    ring::default_provider()
        .install_default()
        .expect("failed to install rustls crypto provider");

    let app = Router::new()
        .route("/sync", post(routes::sync::sync_confessions))
        .route("/cleanup", post(routes::cleanup::cleanup_expired_images))
        .route("/confessions", get(routes::confessions::list_confessions))
        .route(
            "/confessions/{id}",
            get(routes::confessions::get_confession).delete(routes::confessions::delete_confession),
        )
        .route(
            "/confessions/{id}/use",
            put(routes::confessions::mark_confession_as_used),
        )
        .route(
            "/confessions/{id}/restore",
            put(routes::confessions::restore_confession),
        )
        .route(
            "/confessions/{id}/tags",
            put(routes::confessions::update_confession_tags),
        )
        .route(
            "/confessions/{id}/stats",
            put(routes::confessions::update_confession_stats),
        )
        .route(
            "/confessions/{id}/generate",
            post(routes::confessions::generate_confession_images),
        )
        .route(
            "/confessions/{id}/slides/{index}",
            get(routes::confessions::get_confession_slide),
        )
        .route(
            "/confessions/{id}/memes/{index}",
            get(routes::confessions::get_confession_meme),
        )
        .route("/tags", get(routes::tags::list_tags).post(routes::tags::create_tag))
        .route(
            "/tags/{id}",
            put(routes::tags::update_tag).delete(routes::tags::delete_tag),
        )
        .route(
            "/settings/template",
            get(routes::settings::get_template_config).put(routes::settings::update_template_config),
        )
        .route(
            "/settings/{key}",
            get(routes::settings::get_setting).put(routes::settings::update_setting),
        );

    // Enkel in debug-builds (cargo run) - een release-build (zoals de Docker-image,
    // zie Dockerfile) bevat deze laag helemaal niet. Nodig omdat de frontend-dev-
    // server (Vite, :5173) en de backend (:8080) lokaal andere origins zijn; in
    // productie draaien ze same-origin (issue #74), dus daar is dit overbodig.
    let app = if cfg!(debug_assertions) {
        app.layer(dev_cors_layer())
    } else {
        app
    };

    let port = config::server_port();
    let listener = TcpListener::bind(("0.0.0.0", port)).await?;
    println!("Server luistert op poort {port}");

    axum::serve(listener, app).await?;

    Ok(())
}

/// Specifieke origin i.p.v. een wildcard - api/confessions.ts stuurt
/// `credentials: 'include'` mee, en credentialed requests staan geen
/// wildcard-origin toe (browser-beperking, niet iets wat CorsLayer omzeilt).
fn dev_cors_layer() -> CorsLayer {
    CorsLayer::new()
        .allow_origin(HeaderValue::from_static("http://localhost:5173"))
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([CONTENT_TYPE])
        .allow_credentials(true)
}