use axum::Router;
use axum::routing::delete;
use axum::routing::get;
use axum::routing::post;
use axum::routing::put;
use rustls::crypto::ring;
use tokio::net::TcpListener;

mod business;
mod config;
mod model;
mod routes;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    ring::default_provider()
        .install_default()
        .expect("failed to install rustls crypto provider");

    let app = Router::new()
        .route("/sync", post(routes::sync::sync_confessions))
        .route("/confessions", get(routes::confessions::list_confessions))
        .route(
            "/confessions/{id}",
            delete(routes::confessions::delete_confession),
        )
        .route(
            "/confessions/{id}/tags",
            put(routes::confessions::update_confession_tags),
        )
        .route("/tags", post(routes::tags::create_tag))
        .route(
            "/tags/{id}",
            put(routes::tags::update_tag).delete(routes::tags::delete_tag),
        );

    let port = config::server_port();
    let listener = TcpListener::bind(("0.0.0.0", port)).await?;
    println!("Server luistert op poort {port}");

    axum::serve(listener, app).await?;

    Ok(())
}