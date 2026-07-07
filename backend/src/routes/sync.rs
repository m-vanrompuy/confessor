//! Controller-laag: orkestreert de sync van Google Sheet naar Firestore.
//! Volgorde: rijen ophalen -> nieuwe rijen filteren -> titel maken -> opslaan.

use crate::business::dedupe::filter_new_rows;
use crate::business::title::generate_title;
use crate::model::firestore;
use crate::model::sheets;
use crate::model::sheets::RawConfessionRow;
use axum::Json;
use axum::http::StatusCode;
use serde::Serialize;

const TITLE_MAX_LENGTH: usize = 60;

#[derive(Serialize)]
pub struct SyncResult {
    pub new_confessions_count: usize,
}

/// HTTP-handler voor POST /sync.
pub async fn sync_confessions() -> Result<Json<SyncResult>, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let new_rows = fetch_new_confession_rows(&db).await.map_err(internal_error)?;
    save_all_confessions(&db, &new_rows).await.map_err(internal_error)?;

    Ok(Json(SyncResult {
        new_confessions_count: new_rows.len(),
    }))
}

/// Haalt de sheet op en houdt enkel de rijen over die nog niet in Firestore staan.
async fn fetch_new_confession_rows(
    db: &::firestore::FirestoreDb,
) -> Result<Vec<RawConfessionRow>, Box<dyn std::error::Error>> {
    let raw_rows = sheets::fetch_raw_rows().await?;
    let confessions = sheets::parse_rows(&raw_rows);
    let existing_ids = firestore::fetch_existing_confession_ids(db).await?;

    Ok(filter_new_rows(confessions, &existing_ids))
}

/// Genereert per rij een titel en slaat de confession op in Firestore.
async fn save_all_confessions(
    db: &::firestore::FirestoreDb,
    rows: &[RawConfessionRow],
) -> Result<(), Box<dyn std::error::Error>> {
    for row in rows {
        let title = generate_title(&row.text, TITLE_MAX_LENGTH);
        firestore::save_confession(db, row, &title).await?;
    }

    Ok(())
}

fn internal_error(error: Box<dyn std::error::Error>) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, error.to_string())
}
