//! Controller-laag: HTTP-routes voor confessions.

use crate::business::caption;
use crate::business::numbering::determine_next_sequence_number;
use crate::business::tagging::dedupe_tag_ids;
use crate::business::template::{split_text_into_slides, wrap_paragraph_into_lines};
use crate::business::tombstone::build_tombstoned_content;
use crate::model::firestore;
use crate::model::firestore::Confession;
use crate::model::firestore::ConfessionStatus;
use crate::model::firestore::TemplateConfig;
use crate::model::image_render;
use crate::model::image_render::SlideRenderInput;
use crate::model::storage;
use axum::Json;
use axum::extract::Path;
use axum::extract::Query;
use axum::http::StatusCode;
use serde::Deserialize;
use serde::Serialize;

/// Teaser in de voorgestelde caption blijft kort - de volledige tekst staat al in de afbeelding.
const CAPTION_TEASER_MAX_LENGTH: usize = 150;

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

#[derive(Serialize)]
pub struct GenerateImagesResponse {
    slide_paths: Vec<String>,
    suggested_caption: String,
}

/// HTTP-handler voor POST /confessions/{id}/generate. Verdeelt de tekst over slides,
/// rendert elke slide naar PNG, uploadt ze, en stelt een caption voor.
pub async fn generate_confession_images(
    Path(confession_id): Path<String>,
) -> Result<Json<GenerateImagesResponse>, (StatusCode, String)> {
    let db = firestore::make_firestore_client().await.map_err(internal_error)?;

    let confession = fetch_confession_or_404(&db, &confession_id).await?;
    let sequence_number = require_sequence_number(&confession)?;
    let template_config = fetch_template_config_or_error(&db).await?;

    let slide_paths = render_and_upload_slides(&confession_id, &confession.text, sequence_number, &template_config)
        .await
        .map_err(internal_error)?;

    let suggested_caption = caption::suggest_caption(sequence_number, &confession.text, CAPTION_TEASER_MAX_LENGTH);

    firestore::save_generated_images(&db, &confession_id, &slide_paths, &suggested_caption)
        .await
        .map_err(internal_error)?;

    Ok(Json(GenerateImagesResponse { slide_paths, suggested_caption }))
}

async fn fetch_confession_or_404(
    db: &::firestore::FirestoreDb,
    confession_id: &str,
) -> Result<Confession, (StatusCode, String)> {
    firestore::fetch_confession_by_id(db, confession_id)
        .await
        .map_err(internal_error)?
        .ok_or((StatusCode::NOT_FOUND, "confession niet gevonden".to_string()))
}

fn require_sequence_number(confession: &Confession) -> Result<u32, (StatusCode, String)> {
    confession.sequence_number.ok_or((
        StatusCode::BAD_REQUEST,
        "confession moet eerst gemarkeerd zijn als gebruikt (volgnummer ontbreekt)".to_string(),
    ))
}

async fn fetch_template_config_or_error(
    db: &::firestore::FirestoreDb,
) -> Result<TemplateConfig, (StatusCode, String)> {
    firestore::get_template_config(db)
        .await
        .map_err(internal_error)?
        .ok_or((
            StatusCode::BAD_REQUEST,
            "template-instellingen nog niet geconfigureerd".to_string(),
        ))
}

/// Verdeelt de tekst over slides, rendert en uploadt elke slide, en geeft de
/// storage-paden terug op volgorde.
async fn render_and_upload_slides(
    confession_id: &str,
    text: &str,
    sequence_number: u32,
    template_config: &TemplateConfig,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let slide_texts = split_text_into_slides(text, template_config.max_chars_per_slide as usize);
    let max_chars_per_line = image_render::max_chars_per_line(template_config.font_size);

    let mut slide_paths = Vec::new();
    for (index, slide_text) in slide_texts.iter().enumerate() {
        let path = render_and_upload_one_slide(
            confession_id,
            index,
            slide_text,
            sequence_number,
            template_config,
            max_chars_per_line,
        )
        .await?;
        slide_paths.push(path);
    }

    Ok(slide_paths)
}

async fn render_and_upload_one_slide(
    confession_id: &str,
    slide_index: usize,
    slide_text: &str,
    sequence_number: u32,
    template_config: &TemplateConfig,
    max_chars_per_line: usize,
) -> Result<String, Box<dyn std::error::Error>> {
    let lines = wrap_paragraph_into_lines(slide_text, max_chars_per_line);
    let render_input = SlideRenderInput {
        lines: &lines,
        sequence_number,
        font_family: &template_config.font_family,
        font_size: template_config.font_size,
        text_color: &template_config.text_color,
    };

    let png_bytes = image_render::render_slide_to_png(&render_input)?;
    let object_path = format!("confessions/{confession_id}/slide-{}.png", slide_index + 1);

    storage::upload_png(&object_path, png_bytes).await
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
