//! Controller-laag: HTTP-routes voor confessions.

use crate::model::firestore;
use crate::model::firestore::Confession;
use crate::model::firestore::ConfessionStatus;
use axum::Json;
use axum::extract::Query;
use axum::http::StatusCode;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct ConfessionListQuery {
    /// Bv. "new", "used" of "deleted". Onbekende waarden worden genegeerd (= geen filter).
    status: Option<String>,
    /// Komma-gescheiden tag-ID's, bv. "meme,zoekertje".
    tags: Option<String>,
}

/// HTTP-handler voor GET /confessions?status=...&tags=....
pub async fn list_confessions(
    Query(query): Query<ConfessionListQuery>,
) -> Result<Json<Vec<Confession>>, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let status_filter = parse_status_filter(&query.status);
    let tag_filter = parse_tag_filter(&query.tags);

    let confessions = firestore::fetch_confessions(&db, status_filter, tag_filter)
        .await
        .map_err(internal_error)?;

    Ok(Json(confessions))
}

fn parse_status_filter(status: &Option<String>) -> Option<ConfessionStatus> {
    status.as_ref().and_then(|value| ConfessionStatus::from_query_str(value))
}

fn parse_tag_filter(tags: &Option<String>) -> Option<Vec<String>> {
    tags.as_ref().map(|value| value.split(',').map(String::from).collect())
}

fn internal_error(error: Box<dyn std::error::Error>) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, error.to_string())
}
