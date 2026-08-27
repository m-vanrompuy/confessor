//! Controller-laag: HTTP-routes voor confessions.

use crate::business::caption;
use crate::business::numbering::determine_next_sequence_number;
use crate::business::restore::find_matching_row;
use crate::business::tagging::dedupe_tag_ids;
use crate::business::template::{split_text_into_slides, wrap_paragraph_into_lines};
use crate::business::tombstone::build_tombstoned_content;
use crate::business::tombstone::storage_paths_to_delete;
use crate::model::drive;
use crate::model::firestore;
use crate::model::firestore::Confession;
use crate::model::firestore::ConfessionStatus;
use crate::model::firestore::TemplateConfig;
use crate::model::image_render;
use crate::model::image_render::MemeInput;
use crate::model::image_render::MemePosition;
use crate::model::image_render::SlideRenderInput;
use crate::model::sheets;
use crate::model::storage;
use axum::Json;
use axum::extract::Path;
use axum::extract::Query;
use axum::http::StatusCode;
use axum::http::header;
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

/// HTTP-handler voor GET /confessions/{id} - voor de Detail-pagina (issue #92).
/// Haalt ook best-effort de meme(s) op uit Drive als dat nog niet eerder gebeurde
/// (issue #114) - anders toont de meme-preview van #109 pas iets zodra er al
/// afbeeldingen gegenereerd zijn, wat net het doel mist (vóór het genereren al
/// kunnen zien wat er precies is ingestuurd). `ensure_memes_stored` is zelf al
/// idempotent/no-op zodra `meme_attachments` niet leeg is, dus dit kost geen
/// extra Drive-aanroepen bij herhaald bekijken.
pub async fn get_confession(Path(confession_id): Path<String>) -> Result<Json<Confession>, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let confession = fetch_confession_or_404(&db, &confession_id).await?;
    let meme_attachments = ensure_memes_stored(&db, &confession).await;

    Ok(Json(Confession { meme_attachments, ..confession }))
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

/// HTTP-handler voor DELETE /confessions/{id}. Past het tombstone-pattern toe:
/// verwijdert eerst de storage-objecten (slides + originele memes, issue #99), en
/// wist pas daarna de Firestore-inhoud - zo blijft de confession nog gewoon
/// zichtbaar/opnieuw te proberen als de storage-opruiming faalt.
pub async fn delete_confession(
    Path(confession_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let confession = fetch_confession_or_404(&db, &confession_id).await?;

    delete_confession_storage_objects(&confession).await.map_err(internal_error)?;

    let tombstoned_content = build_tombstoned_content();
    firestore::delete_confession(&db, &confession_id, tombstoned_content)
        .await
        .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
}

/// HTTP-handler voor PUT /confessions/{id}/restore (issue #100). Haalt de
/// originele tekst terug uit de Sheet - delete raakt de Sheet nooit aan, enkel
/// Firestore - en zet de confession terug op "new", alsof ze net opnieuw gesynct
/// is. Volgnummer, tags, gegenereerde afbeeldingen en stats blijven gewist; die
/// ontstaan pas weer via de normale flow (markeren als gebruikt, genereren, ...).
pub async fn restore_confession(
    Path(confession_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    let confession = fetch_confession_or_404(&db, &confession_id).await?;
    require_deleted_status(&confession)?;

    let raw_rows = sheets::fetch_raw_rows().await.map_err(internal_error)?;
    let rows = sheets::parse_rows(&raw_rows);
    let matching_row = find_matching_row(&rows, &confession_id).ok_or((
        StatusCode::NOT_FOUND,
        "originele tekst niet meer teruggevonden in de Sheet".to_string(),
    ))?;

    firestore::restore_confession(&db, &confession_id, matching_row)
        .await
        .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
}

fn require_deleted_status(confession: &Confession) -> Result<(), (StatusCode, String)> {
    if confession.status != "deleted" {
        return Err((StatusCode::BAD_REQUEST, "enkel verwijderde confessions kunnen hersteld worden".to_string()));
    }
    Ok(())
}

async fn delete_confession_storage_objects(confession: &Confession) -> Result<(), Box<dyn std::error::Error>> {
    for object_path in storage_paths_to_delete(confession) {
        storage::delete_object(&object_path).await?;
    }
    Ok(())
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

#[derive(Deserialize)]
pub struct UpdateStatsRequest {
    like_count: u32,
    comment_count: u32,
    /// Optioneel - de admin plakt deze manueel in nadat de confession op Instagram
    /// gepost is (issue #90).
    instagram_post_url: Option<String>,
}

/// HTTP-handler voor PUT /confessions/{id}/stats. Manuele update, later te vervangen
/// door een automatische koppeling met de Meta Graph API.
pub async fn update_confession_stats(
    Path(confession_id): Path<String>,
    Json(request): Json<UpdateStatsRequest>,
) -> Result<StatusCode, (StatusCode, String)> {
    let db = firestore::make_firestore_client()
        .await
        .map_err(internal_error)?;

    firestore::update_confession_stats(
        &db,
        &confession_id,
        request.like_count,
        request.comment_count,
        request.instagram_post_url,
    )
    .await
    .map_err(internal_error)?;

    Ok(StatusCode::NO_CONTENT)
}

#[derive(Deserialize)]
pub struct GenerateImagesQuery {
    /// "before" of "after" - waar de meme t.o.v. de tekst komt te staan op de slide
    /// die 'm krijgt (zie choose_meme_position). Default: "after".
    meme_position: Option<String>,
    /// 1.0 = standaardgrootte, geclamped tussen MEME_SCALE_MIN/MAX (zie
    /// choose_meme_scale). Default: 1.0.
    meme_scale: Option<f64>,
}

/// Alles wat nodig is om de meme in één specifieke slide te componeren - gebundeld
/// i.p.v. een groeiende tuple, wordt gewoon doorgegeven aan render_and_upload_slides.
#[derive(Clone, Copy)]
struct MemeCompositing<'a> {
    bytes: &'a [u8],
    content_type: &'a str,
    position: MemePosition,
    scale: f64,
}

#[derive(Serialize)]
pub struct GenerateImagesResponse {
    slide_paths: Vec<String>,
    suggested_caption: String,
    /// Leeg als er geen meme was, of als het ophalen volledig mislukte - dat mag de
    /// rest van het genereren niet blokkeren (zie ensure_memes_stored). Meestal 1,
    /// kan er meerdere zijn als het formulier-antwoord meerdere bestanden bevatte -
    /// enkel de eerste wordt effectief in een slide gecomponeerd (issue #65, v1).
    meme_storage_paths: Vec<String>,
}

/// HTTP-handler voor POST /confessions/{id}/generate. Verdeelt de tekst over slides,
/// rendert elke slide naar PNG (de eerste meme, indien aanwezig, gecomponeerd in de
/// laatste slide), uploadt ze, stelt een caption voor, en haalt best-effort de
/// meme(s) op (issue #38b) als die er zijn en nog niet eerder opgehaald werden.
pub async fn generate_confession_images(
    Path(confession_id): Path<String>,
    Query(query): Query<GenerateImagesQuery>,
) -> Result<Json<GenerateImagesResponse>, (StatusCode, String)> {
    let db = firestore::make_firestore_client().await.map_err(internal_error)?;

    let confession = fetch_confession_or_404(&db, &confession_id).await?;
    let sequence_number = require_sequence_number(&confession)?;
    let template_config = fetch_template_config_or_error(&db).await?;
    let meme_position = choose_meme_position(&query.meme_position);
    let meme_scale = choose_meme_scale(query.meme_scale);

    let memes = ensure_memes_stored(&db, &confession).await;
    let meme_bytes = load_first_meme_bytes(&memes).await;
    let meme_for_compositing = meme_bytes.as_ref().map(|(bytes, content_type)| MemeCompositing {
        bytes: bytes.as_slice(),
        content_type: content_type.as_str(),
        position: meme_position,
        scale: meme_scale,
    });

    let slide_paths = render_and_upload_slides(
        &confession_id,
        &confession.text,
        sequence_number,
        &template_config,
        meme_for_compositing,
    )
    .await
    .map_err(internal_error)?;

    let suggested_caption = caption::suggest_caption(sequence_number, &confession.text, CAPTION_TEASER_MAX_LENGTH);

    firestore::save_generated_images(&db, &confession_id, &slide_paths, &suggested_caption)
        .await
        .map_err(internal_error)?;

    let meme_storage_paths = memes.into_iter().map(|meme| meme.storage_path).collect();

    Ok(Json(GenerateImagesResponse { slide_paths, suggested_caption, meme_storage_paths }))
}

fn choose_meme_position(requested: &Option<String>) -> MemePosition {
    match requested.as_deref() {
        Some("before") => MemePosition::Before,
        _ => MemePosition::After,
    }
}

/// Clampt naar image_render::MEME_SCALE_MIN/MAX - beschermt tegen een onleesbaar
/// kleine of kaart-overschrijdend grote meme via een geknoeide query-param.
fn choose_meme_scale(requested: Option<f64>) -> f64 {
    requested
        .unwrap_or(1.0)
        .clamp(image_render::MEME_SCALE_MIN, image_render::MEME_SCALE_MAX)
}

/// Downloadt de bytes van de eerste meme uit Storage, zodat ze in de SVG gecomponeerd
/// kunnen worden. Best-effort: als de download faalt (object toch weg, netwerkfout),
/// wordt er gewoon zonder meme gerenderd i.p.v. het hele genereren te laten falen.
async fn load_first_meme_bytes(memes: &[firestore::MemeAttachment]) -> Option<(Vec<u8>, String)> {
    let first_meme = memes.first()?;

    match storage::download_object(&first_meme.storage_path).await {
        Ok(bytes) => Some((bytes, first_meme.content_type.clone())),
        Err(error) => {
            eprintln!("meme downloaden voor compositing mislukt ({}): {error}", first_meme.storage_path);
            None
        }
    }
}

/// Haalt de meme(s) op van Drive en slaat eigen kopieën op, als er een `image_link` is
/// en dat nog niet eerder gebeurd is. Bewust best-effort per bestand: één kapotte/
/// ontoegankelijke link in een antwoord met meerdere bestanden mag de andere, wel
/// geslaagde bestanden niet blokkeren - enkel loggen en verdergaan.
async fn ensure_memes_stored(db: &::firestore::FirestoreDb, confession: &Confession) -> Vec<firestore::MemeAttachment> {
    if !confession.meme_attachments.is_empty() {
        return confession.meme_attachments.clone();
    }

    let Some(drive_link) = confession.image_link.as_ref() else {
        return Vec::new();
    };
    let file_ids = drive::extract_file_ids(drive_link);

    let mut attachments = Vec::new();
    for (index, file_id) in file_ids.iter().enumerate() {
        match fetch_and_store_meme(&confession.id, index, file_id).await {
            Ok(attachment) => attachments.push(attachment),
            Err(error) => eprintln!("meme ophalen mislukt voor confession {} ({file_id}): {error}", confession.id),
        }
    }

    if !attachments.is_empty() {
        if let Err(error) = firestore::save_memes(db, &confession.id, attachments.clone()).await {
            eprintln!("meme-referenties opslaan mislukt voor confession {}: {error}", confession.id);
        }
    }

    attachments
}

async fn fetch_and_store_meme(
    confession_id: &str,
    index: usize,
    file_id: &str,
) -> Result<firestore::MemeAttachment, Box<dyn std::error::Error>> {
    let file = drive::download_file(file_id).await?;
    let extension = drive::extension_for_content_type(&file.content_type);
    let object_path = format!("confessions/{confession_id}/meme-{}.{extension}", index + 1);

    let storage_path = storage::upload_object(&object_path, file.bytes, &file.content_type).await?;

    Ok(firestore::MemeAttachment { storage_path, content_type: file.content_type })
}

/// HTTP-handler voor GET /confessions/{id}/slides/{index}. Index is 1-based, zelfde
/// nummering als in de storage-paden (slide-1.png, slide-2.png, ...). Streamt de
/// PNG-bytes door de backend heen - geen signed URLs, dezelfde IAM-gate als de rest.
pub async fn get_confession_slide(
    Path((confession_id, slide_index)): Path<(String, usize)>,
) -> Result<([(header::HeaderName, &'static str); 1], Vec<u8>), (StatusCode, String)> {
    let db = firestore::make_firestore_client().await.map_err(internal_error)?;

    let confession = fetch_confession_or_404(&db, &confession_id).await?;
    let object_path = slide_path_or_404(&confession, slide_index)?;

    let png_bytes = storage::download_object(object_path).await.map_err(internal_error)?;

    Ok(([(header::CONTENT_TYPE, "image/png")], png_bytes))
}

fn slide_path_or_404(confession: &Confession, slide_index: usize) -> Result<&str, (StatusCode, String)> {
    if slide_index == 0 {
        return Err((StatusCode::BAD_REQUEST, "slide-index start bij 1".to_string()));
    }

    confession
        .slide_paths
        .get(slide_index - 1)
        .map(String::as_str)
        .ok_or((
            StatusCode::NOT_FOUND,
            "slide niet gevonden (nog niet gegenereerd, of al opgeruimd)".to_string(),
        ))
}

/// HTTP-handler voor GET /confessions/{id}/memes/{index} (issue #109). Index is
/// 1-based, zelfde volgorde als `meme_attachments`. Toont de originele, door de
/// inzender geüploade bijlage - dus vóór compositing in een gegenereerde slide,
/// en met de écht opgeslagen content-type (memes zijn niet altijd PNG).
pub async fn get_confession_meme(
    Path((confession_id, meme_index)): Path<(String, usize)>,
) -> Result<([(header::HeaderName, String); 1], Vec<u8>), (StatusCode, String)> {
    let db = firestore::make_firestore_client().await.map_err(internal_error)?;

    let confession = fetch_confession_or_404(&db, &confession_id).await?;
    let attachment = meme_attachment_or_404(&confession, meme_index)?;

    let bytes = storage::download_object(&attachment.storage_path)
        .await
        .map_err(internal_error)?;

    Ok(([(header::CONTENT_TYPE, attachment.content_type.clone())], bytes))
}

fn meme_attachment_or_404(
    confession: &Confession,
    meme_index: usize,
) -> Result<&firestore::MemeAttachment, (StatusCode, String)> {
    if meme_index == 0 {
        return Err((StatusCode::BAD_REQUEST, "meme-index start bij 1".to_string()));
    }

    confession
        .meme_attachments
        .get(meme_index - 1)
        .ok_or((StatusCode::NOT_FOUND, "meme-bijlage niet gevonden".to_string()))
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
/// `meme` (bytes, content-type, positie) wordt enkel gecomponeerd in de LÁÁTSTE
/// slide - meme als afsluitende visual, consistent met hoe KUL Confessions dit zelf
/// doet (zie referentiebeeld bij issue #65). Andere slides blijven pure tekst.
async fn render_and_upload_slides(
    confession_id: &str,
    text: &str,
    sequence_number: u32,
    template_config: &TemplateConfig,
    meme: Option<MemeCompositing<'_>>,
) -> Result<Vec<String>, Box<dyn std::error::Error>> {
    let slide_texts = split_text_into_slides(text, template_config.max_chars_per_slide as usize);
    let max_chars_per_line = image_render::max_chars_per_line(template_config.font_size);
    let last_slide_index = slide_texts.len().saturating_sub(1);

    let mut slide_paths = Vec::new();
    for (index, slide_text) in slide_texts.iter().enumerate() {
        let meme_for_this_slide = if index == last_slide_index { meme } else { None };

        let path = render_and_upload_one_slide(
            confession_id,
            index,
            slide_text,
            sequence_number,
            template_config,
            max_chars_per_line,
            meme_for_this_slide,
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
    meme: Option<MemeCompositing<'_>>,
) -> Result<String, Box<dyn std::error::Error>> {
    let lines = wrap_paragraph_into_lines(slide_text, max_chars_per_line);
    let meme_input = meme.map(|m| MemeInput { bytes: m.bytes, content_type: m.content_type, position: m.position, scale: m.scale });
    let render_input = SlideRenderInput {
        lines: &lines,
        sequence_number,
        font_family: &template_config.font_family,
        font_size: template_config.font_size,
        text_color: &template_config.text_color,
        meme: meme_input,
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::firestore::MemeAttachment;
    use chrono::Utc;

    /// Integratietest tegen echte Firestore + Storage (issue #99, zelfde stijl als
    /// model::storage::tests) - zet een synthetische confession neer met slides,
    /// een meme en gepubliceerde stats, roept de echte DELETE-flow aan, en ruimt
    /// zichzelf hoe dan ook op, ook als een assertie faalt.
    #[tokio::test]
    async fn delete_confession_wipes_content_but_keeps_the_title() {
        dotenvy::dotenv().ok();
        // Firestore's gRPC-verbinding heeft rustls nodig - normaal geïnstalleerd in
        // main() bij opstart, maar `cargo test` roept main() nooit aan. .ok() omdat
        // een tweede install (bij meerdere Firestore-tests) een Err teruggeeft.
        rustls::crypto::ring::default_provider().install_default().ok();

        let db = firestore::make_firestore_client().await.expect("firestore client");
        let confession_id = "test-issue-99-delete-flow";
        let slide_path = "test/issue-99-fake-slide.png";
        let meme_path = "test/issue-99-fake-meme.png";

        let one_pixel_png: Vec<u8> = vec![
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00,
            0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00,
            0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01,
            0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
        ];
        storage::upload_png(slide_path, one_pixel_png.clone()).await.expect("upload slide");
        storage::upload_png(meme_path, one_pixel_png).await.expect("upload meme");

        let synthetic_confession = Confession {
            id: confession_id.to_string(),
            timestamp: "1-1-2026 00:00:00".to_string(),
            title: "Titel die moet blijven".to_string(),
            text: "Tekst die gewist moet worden".to_string(),
            status: "used".to_string(),
            tag_ids: vec!["tag-1".to_string()],
            sequence_number: Some(999),
            suggested_caption: Some("caption".to_string()),
            slide_paths: vec![slide_path.to_string()],
            used_at: Some(Utc::now()),
            like_count: Some(5),
            comment_count: Some(2),
            meme_attachments: vec![MemeAttachment { storage_path: meme_path.to_string(), content_type: "image/png".to_string() }],
            ..Default::default()
        };

        db.fluent()
            .insert()
            .into(firestore::CONFESSIONS_COLLECTION)
            .document_id(confession_id)
            .object(&synthetic_confession)
            .execute::<Confession>()
            .await
            .expect("insert synthetic confession");

        let delete_result = delete_confession(Path(confession_id.to_string())).await;
        let after_delete = firestore::fetch_confession_by_id(&db, confession_id).await;

        // Opruimen vóór de asserts - het echte Firestore-document mag hoe dan ook niet
        // blijven staan, ook al faalt een assertie hieronder.
        db.fluent()
            .delete()
            .from(firestore::CONFESSIONS_COLLECTION)
            .document_id(confession_id)
            .execute()
            .await
            .expect("cleanup: synthetic document verwijderen");

        assert!(delete_result.is_ok(), "delete_confession zou moeten lukken: {:?}", delete_result.err());

        let after_delete = after_delete.expect("refetch mag niet falen").expect("confession moet getombstoned zijn, niet weg");
        assert_eq!(after_delete.title, "Titel die moet blijven");
        assert_eq!(after_delete.status, "deleted");
        assert_eq!(after_delete.text, "");
        assert!(after_delete.tag_ids.is_empty());
        assert!(after_delete.slide_paths.is_empty());
        assert!(after_delete.suggested_caption.is_none());
        assert!(after_delete.meme_attachments.is_empty());
        assert!(after_delete.sequence_number.is_none());
        assert!(after_delete.used_at.is_none());
        assert!(after_delete.like_count.is_none());
        assert!(after_delete.comment_count.is_none());

        assert!(storage::download_object(slide_path).await.is_err(), "slide had verwijderd moeten zijn uit storage");
        assert!(storage::download_object(meme_path).await.is_err(), "meme had verwijderd moeten zijn uit storage");
    }
}
