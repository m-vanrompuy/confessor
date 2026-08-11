//! Controller-laag: dagelijkse opruim-job voor verlopen confessie-afbeeldingen.
//! Wordt aangeroepen door Cloud Scheduler, niet door de admin zelf (zie issue #61).

use crate::business::cleanup::find_expired_confessions;
use crate::model::firestore;
use crate::model::firestore::Confession;
use crate::model::firestore::ConfessionStatus;
use crate::model::storage;
use axum::Json;
use axum::http::StatusCode;
use chrono::Utc;
use serde::Serialize;

const DEFAULT_RETENTION_DAYS: u32 = 30;
const RETENTION_DAYS_SETTING_KEY: &str = "image_retention_days";

#[derive(Serialize)]
pub struct CleanupResult {
    cleaned_confessions_count: usize,
}

/// HTTP-handler voor POST /cleanup.
pub async fn cleanup_expired_images() -> Result<Json<CleanupResult>, (StatusCode, String)> {
    let db = firestore::make_firestore_client().await.map_err(internal_error)?;

    let used_confessions = firestore::fetch_confessions(&db, Some(ConfessionStatus::Used), None)
        .await
        .map_err(internal_error)?;

    let retention_days = fetch_retention_days(&db).await.map_err(internal_error)?;
    let expired = find_expired_confessions(&used_confessions, retention_days, Utc::now());

    for confession in &expired {
        clean_up_one_confession(&db, confession).await.map_err(internal_error)?;
    }

    Ok(Json(CleanupResult { cleaned_confessions_count: expired.len() }))
}

async fn fetch_retention_days(db: &::firestore::FirestoreDb) -> Result<u32, Box<dyn std::error::Error>> {
    let stored_value = firestore::get_setting(db, RETENTION_DAYS_SETTING_KEY).await?;
    let parsed_value = stored_value.and_then(|value| value.parse().ok());
    Ok(parsed_value.unwrap_or(DEFAULT_RETENTION_DAYS))
}

async fn clean_up_one_confession(
    db: &::firestore::FirestoreDb,
    confession: &Confession,
) -> Result<(), Box<dyn std::error::Error>> {
    for slide_path in &confession.slide_paths {
        storage::delete_object(slide_path).await?;
    }

    firestore::clear_slide_paths(db, &confession.id).await
}

fn internal_error(error: Box<dyn std::error::Error>) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, error.to_string())
}
