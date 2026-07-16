use firestore::FirestoreDb;

const PROJECT_ID: &str = "confessions-461517";

pub mod confessions;
pub mod tags;
pub mod settings;

pub use confessions::*;
pub use tags::*;
pub use settings::*;

pub async fn make_firestore_client() -> Result<FirestoreDb, Box<dyn std::error::Error>> {
    let db = FirestoreDb::new(PROJECT_ID).await?;
    Ok(db)
}