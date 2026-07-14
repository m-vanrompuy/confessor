//! Controller-laag: HTTP-routes voor tags (aanmaken, hernoemen + kleur zetten, verwijderen).

use crate::model::firestore;
use crate::model::firestore::Tag;
use axum::Json;
use axum::extract::Path;
use axum::http::StatusCode;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct CreateTagRequest {
    name: String,
    color: String,
}

#[derive(Deserialize)]
pub struct UpdateTagRequest {
    name: String,
    color: String,
}

/// HTTP-handler voor POST /tags.
pub async fn create_tag(
    Json(request): Json<CreateTagRequest>,
) -> Result<Json<Tag>, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let tag = firestore::create_tag(&db, &request.name, &request.color)
        .await
        .map_err(internal_error)?;

    Ok(Json(tag))
}

/// HTTP-handler voor PUT /tags/{id}. Werkt naam én kleur in één keer bij.
pub async fn update_tag(
    Path(tag_id): Path<String>,
    Json(request): Json<UpdateTagRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    firestore::rename_tag(&db, &tag_id, &request.name)
        .await
        .map_err(internal_error)?;

    firestore::set_tag_color(&db, &tag_id, &request.color)
        .await
        .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
}

/// HTTP-handler voor DELETE /tags/{id}.
pub async fn delete_tag(
    Path(tag_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    firestore::delete_tag(&db, &tag_id)
        .await
        .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
}

fn internal_error(error: Box<dyn std::error::Error>) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, error.to_string())
}
