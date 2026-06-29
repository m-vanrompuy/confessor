mod config;
mod routes;
mod business;
mod model;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let rows = model::sheets::fetch_raw_rows().await?;
    let confessions = model::sheets::parse_rows(&rows);

    println!("Aantal geldige confessions: {}", confessions.len());
    for c in confessions.iter().take(3) {
        println!("{c:?}");
    }

    Ok(())
}