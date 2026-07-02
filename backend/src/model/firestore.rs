use crate::business::dedupe::calculate_confession_id;
use crate::model::sheets::RawConfessionRow;
use firestore::FirestoreDb;
use serde::{Deserialize, Serialize};

const PROJECT_ID: &str = "confessions-461517";
const CONFESSIONS_COLLECTION: &str = "confessions";

#[derive(Debug, Serialize, Deserialize)]
pub struct Confession {
    pub id: String,
    pub timestamp: String,
    pub text: String,
    pub admin_message: Option<String>,
    pub image_link: Option<String>,
    pub status: String,
}

pub async fn make_firestore_client() -> Result<FirestoreDb, Box<dyn std::error::Error>> {
    let db = FirestoreDb::new(PROJECT_ID).await?;
    Ok(db)
}

/// Slaat een confession op in Firestore.
/// We gebruiken de deterministische ID als document-ID zodat dedupe
/// later triviaal is: "bestaat dit document al?" = "hebben we dit al gezien?"
pub async fn save_confession(
    db: &FirestoreDb,
    row: &RawConfessionRow,
) -> Result<(), Box<dyn std::error::Error>> {
    let id = calculate_confession_id(&row.timestamp, &row.text);

    let confession = Confession {
        id: id.clone(),
        timestamp: row.timestamp.clone(),
        text: row.text.clone(),
        admin_message: row.admin_message.clone(),
        image_link: row.image_link.clone(),
        status: "new".to_string(),
    };

    db.fluent()
        .insert()
        .into(CONFESSIONS_COLLECTION)
        .document_id(&id)
        .object(&confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}