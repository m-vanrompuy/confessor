use gcp_auth::{CustomServiceAccount, TokenProvider};
use std::path::PathBuf;
mod config;
mod routes;
mod business;
mod model;


// Het ID van het confessions-formulier 
const FORM_ID: &str = "1zUsQaV_MGIc2rF7Ll3yuDWtef6g4g1KU4aWSf9sNKqI";

// We vragen enkel leestoegang tot de antwoorden — niets meer.
const SCOPE: &str = "https://www.googleapis.com/auth/forms.responses.readonly";

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Stap 1: het service-account-sleutelbestand inladen.
    let credentials_path = PathBuf::from("secrets/service-account.json");
    let service_account = CustomServiceAccount::from_file(credentials_path)?;

    // Stap 2: een tijdelijk toegangstoken aanvragen voor onze scope.
    let token = service_account.token(&[SCOPE]).await?;

    // Stap 3: de Forms API aanspreken met dat token.
    let url = format!("https://forms.googleapis.com/v1/forms/{FORM_ID}/responses");
    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .bearer_auth(token.as_str())
        .send()
        .await?;

    let status = response.status();
    let body: serde_json::Value = response.json().await?;

    println!("Status: {status}");
    println!("{}", serde_json::to_string_pretty(&body)?);

    Ok(())
}