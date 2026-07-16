use crate::business::settings::validate_setting_value;
use crate::business::settings::validate_template_config;
use crate::model::firestore;
use crate::model::firestore::TemplateConfig;
use axum::Json;
use axum::extract::Path;
use axum::http::StatusCode;
use serde::Deserialize;
use serde::Serialize;

pub async fn get_template_config() -> Result<Json<TemplateConfig>, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let config = firestore::get_template_config(&db)
        .await
        .map_err(internal_error)?;

    match config {
        Some(config) => Ok(Json(config)),
        None => Err((StatusCode::NOT_FOUND, "Nog geen template-configuratie opgeslagen".to_string())),
    }
}

pub async fn update_template_config(
    Json(config): Json<TemplateConfig>,
) -> Result<StatusCode, (StatusCode, String)> {
    validate_template_config(&config).map_err(bad_request)?;

    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    firestore::save_template_config(&db, &config)
        .await
        .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
}

#[derive(Serialize)]
pub struct SettingResponse {
    value: String,
}

pub async fn get_setting(
    Path(key): Path<String>,
) -> Result<Json<SettingResponse>, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let value = firestore::get_setting(&db, &key)
        .await
        .map_err(internal_error)?;

    match value {
        Some(value) => Ok(Json(SettingResponse { value })),
        None => Err((StatusCode::NOT_FOUND, format!("Instelling '{key}' bestaat niet"))),
    }
}

#[derive(Deserialize)]
pub struct UpdateSettingRequest {
    value: String,
}

pub async fn update_setting(
    Path(key): Path<String>,
    Json(request): Json<UpdateSettingRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    validate_setting_value(&request.value).map_err(bad_request)?;

    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    firestore::set_setting(&db, &key, &request.value)
        .await
        .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
}

fn internal_error(error: Box<dyn std::error::Error>) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, error.to_string())
}

fn bad_request(error: String) -> (StatusCode, String) {
    (StatusCode::BAD_REQUEST, error)
}