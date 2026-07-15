//! Controller-laag: HTTP-routes voor confessions.

use crate::business::tagging::dedupe_tag_ids;
use crate::business::numbering::determine_next_sequence_number;
use crate::business::tombstone::build_tombstoned_content;
use crate::model::firestore;
use crate::model::firestore::Confession;
use crate::model::firestore::ConfessionStatus;
use axum::Json;
use axum::extract::Path;
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

#[derive(Deserialize)]
pub struct UpdateConfessionTagsRequest {
    tag_ids: Vec<String>,
}

/// HTTP-handler voor PUT /confessions/{id}/tags. Overschrijft de volledige tag-lijst.
pub async fn update_confession_tags(
    Path(confession_id): Path<String>,
    Json(request): Json<UpdateConfessionTagsRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let deduped_tag_ids = dedupe_tag_ids(request.tag_ids);

    firestore::update_confession_tags(&db, &confession_id, &deduped_tag_ids)
        .await
        .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
}

/// HTTP-handler voor DELETE /confessions/{id}. Past het tombstone-pattern toe.
pub async fn delete_confession(
    Path(confession_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let tombstoned_content = build_tombstoned_content();

    firestore::delete_confession(&db, &confession_id, tombstoned_content)
        .await
        .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
}

/// HTTP-handler voor PUT /confessions/{id}/use. Kent het volgende volgnummer toe
/// en zet de status op "used".
pub async fn mark_confession_as_used(
    Path(confession_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let existing_numbers = firestore::fetch_used_sequence_numbers(&db)
        .await
        .map_err(internal_error)?;

    let next_number = determine_next_sequence_number(&existing_numbers);

    firestore::mark_confession_as_used(&db, &confession_id, next_number)
        .await
        .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
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
