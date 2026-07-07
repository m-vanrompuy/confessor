use axum::Router;
use axum::routing::post;
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

    let app = Router::new().route("/sync", post(routes::sync::sync_confessions));

    let port = config::server_port();
    let listener = TcpListener::bind(("0.0.0.0", port)).await?;
    println!("Server luistert op poort {port}");

    axum::serve(listener, app).await?;

    Ok(())
}