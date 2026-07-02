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
    let existing_ids = model::firestore::fetch_existing_confession_ids(&db).await?;

    let new_confessions = business::dedupe::filter_new_rows(confessions, &existing_ids);
    println!("Nieuwe confessions gevonden: {}", new_confessions.len());


    for confession_row in &new_confessions {
        let title = business::title::generate_title(&confession_row.text, 60);
        model::firestore::save_confession(&db, confession_row, &title).await?;
    }

    println!("Opgeslagen: {}", new_confessions.len());

    Ok(())
}