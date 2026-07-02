use rustls::crypto::ring;

mod config;
mod routes;
mod business;
mod model;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    ring::default_provider()
        .install_default()
        .expect("failed to install rustls crypto provider");

    let rows = model::sheets::fetch_raw_rows().await?;
    let confessions = model::sheets::parse_rows(&rows);

    let db = model::firestore::make_firestore_client().await?;

    let eerste = &confessions[0];
    model::firestore::save_confession(&db, eerste).await?;

    println!("Opgeslagen: {}", eerste.timestamp);

    Ok(())
}