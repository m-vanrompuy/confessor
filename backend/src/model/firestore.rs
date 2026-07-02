use crate::business::dedupe::calculate_confession_id;
use crate::model::sheets::RawConfessionRow;
use firestore::FirestoreDb;
use firestore::paths;
use serde::{Deserialize, Serialize};
use futures::stream::BoxStream;
use futures::StreamExt;
use std::collections::HashSet;

const PROJECT_ID: &str = "confessions-461517";
pub const CONFESSIONS_COLLECTION: &str = "confessions";

#[derive(Debug, Deserialize)]
struct ConfessionIdOnly {
    id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Confession {
    pub id: String,
    pub timestamp: String,
    pub title: String,
    pub text: String,
    pub admin_message: Option<String>,
    pub image_link: Option<String>,
    pub status: String,
}

pub async fn make_firestore_client() -> Result<FirestoreDb, Box<dyn std::error::Error>> {
    let db = FirestoreDb::new(PROJECT_ID).await?;
    Ok(db)
}

// model/firestore.rs
pub async fn save_confession(
    db: &FirestoreDb,
    row: &RawConfessionRow,
    title: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let id = calculate_confession_id(&row.timestamp, &row.text);

    let confession = Confession {
        id: id.clone(),
        timestamp: row.timestamp.clone(),
        title: title.to_string(),
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

pub async fn fetch_existing_confession_ids(
    db: &FirestoreDb,
) -> Result<HashSet<String>, Box<dyn std::error::Error>> {
    let id_stream: BoxStream<ConfessionIdOnly> = db
        .fluent()
        .select()
        .fields(paths!(ConfessionIdOnly::{id}))
        .from(CONFESSIONS_COLLECTION)
        .obj()
        .stream_query()
        .await?;

    let all_ids: Vec<ConfessionIdOnly> = id_stream.collect().await;

    let id_set: HashSet<String> = all_ids.into_iter().map(|item| item.id).collect();

    Ok(id_set)
}

