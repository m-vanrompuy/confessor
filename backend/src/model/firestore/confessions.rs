use crate::business::dedupe::calculate_confession_id;
use crate::model::sheets::RawConfessionRow;
use chrono::{DateTime, Utc};
use firestore::FirestoreDb;
use firestore::paths;
use firestore::path;
use firestore::FirestoreQueryFilter;
use firestore::select_filter_builder::FirestoreQueryFilterBuilder;
use serde::{Deserialize, Serialize};
use futures::stream::BoxStream;
use futures::StreamExt;
use std::collections::HashSet;

pub const CONFESSIONS_COLLECTION: &str = "confessions";

#[derive(Debug, Deserialize)]
struct ConfessionIdOnly {
    id: String,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Confession {
    pub id: String,
    pub timestamp: String,
    pub title: String,
    pub text: String,
    pub admin_message: Option<String>,
    pub image_link: Option<String>,
    pub status: String,
    #[serde(default)]
    pub tag_ids: Vec<String>,
    #[serde(default)]
    pub sequence_number: Option<u32>,
    #[serde(default)]
    pub suggested_caption: Option<String>,
    /// Storage-pad per gerenderde slide, op volgorde (index = slide-nummer).
    #[serde(default)]
    pub slide_paths: Vec<String>,
    /// Wanneer de confession als "gebruikt" gemarkeerd werd - bepaalt samen met de
    /// bewaartermijn-instelling wanneer de afbeeldingen opgeruimd worden (issue #61).
    #[serde(default)]
    pub used_at: Option<DateTime<Utc>>,
    /// Manueel ingevuld door de admin nadat de confession op Instagram gepost is
    /// (issue #90) - geen automatische koppeling, dat staat gepland via de Meta
    /// Graph API (zie README).
    #[serde(default)]
    pub instagram_post_url: Option<String>,
    #[serde(default)]
    pub like_count: Option<u32>,
    #[serde(default)]
    pub comment_count: Option<u32>,
    #[serde(default)]
    pub stats_last_updated_at: Option<DateTime<Utc>>,
    /// Onze eigen kopie(ën) van de meme(s) uit `image_link` (issue #38b). Meestal één,
    /// maar Google Forms staat toe dat een vraag meerdere bestanden per antwoord
    /// toelaat, dus dit is een lijst. Leeg zolang er geen `image_link` is, of die nog
    /// niet opgehaald is.
    #[serde(default)]
    pub meme_attachments: Vec<MemeAttachment>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemeAttachment {
    pub storage_path: String,
    pub content_type: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ConfessionStatus {
    New,
    Used,
    Deleted,
}

impl ConfessionStatus {
    fn as_str(self) -> &'static str {
        match self {
            ConfessionStatus::New => "new",
            ConfessionStatus::Used => "used",
            ConfessionStatus::Deleted => "deleted",
        }
    }

    pub fn from_query_str(value: &str) -> Option<Self> {
        match value {
            "new" => Some(ConfessionStatus::New),
            "used" => Some(ConfessionStatus::Used),
            "deleted" => Some(ConfessionStatus::Deleted),
            _ => None,
        }
    }
}

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
        ..Default::default()
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

pub async fn fetch_confession_by_id(
    db: &FirestoreDb,
    confession_id: &str,
) -> Result<Option<Confession>, Box<dyn std::error::Error>> {
    let confession: Option<Confession> = db
        .fluent()
        .select()
        .by_id_in(CONFESSIONS_COLLECTION)
        .obj()
        .one(confession_id)
        .await?;

    Ok(confession)
}

pub async fn fetch_confessions(
    db: &FirestoreDb,
    status_filter: Option<ConfessionStatus>,
    tag_filter: Option<Vec<String>>,
) -> Result<Vec<Confession>, Box<dyn std::error::Error>> {
    let confessions: Vec<Confession> = db
        .fluent()
        .select()
        .from(CONFESSIONS_COLLECTION)
        .filter(|filter_builder| {
            let conditions = build_filter_conditions(&filter_builder, status_filter, tag_filter.clone());
            filter_builder.for_all(conditions)
        })
        .obj()
        .query()
        .await?;

    Ok(confessions)
}

fn build_filter_conditions(
    filter_builder: &FirestoreQueryFilterBuilder,
    status_filter: Option<ConfessionStatus>,
    tag_filter: Option<Vec<String>>,
) -> Vec<FirestoreQueryFilter> {
    let status_condition = status_filter
        .and_then(|status| filter_builder.field(path!(Confession::status)).eq(status.as_str()));

    let tag_condition = tag_filter
        .and_then(|tags| filter_builder.field(path!(Confession::tag_ids)).array_contains_any(tags));

    [status_condition, tag_condition].into_iter().flatten().collect()
}

pub async fn update_confession_tags(
    db: &FirestoreDb,
    confession_id: &str,
    tag_ids: &[String],
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession {
        tag_ids: tag_ids.to_vec(),
        ..Default::default()
    };

    db.fluent()
        .update()
        .fields(paths!(Confession::{tag_ids}))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}

/// `title` blijft ongewijzigd (staat niet in TombstonedContent) - alle andere
/// inhoud, gegenereerde afbeeldingen en statistieken worden gewist (issue #99, zie
/// business::tombstone). De storage-objecten zelf worden vóór deze aanroep al
/// verwijderd door de caller (routes/confessions.rs).
pub async fn delete_confession(
    db: &FirestoreDb,
    confession_id: &str,
    tombstoned_content: crate::business::tombstone::TombstonedContent,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession {
        status: tombstoned_content.status,
        text: tombstoned_content.text,
        admin_message: tombstoned_content.admin_message,
        image_link: tombstoned_content.image_link,
        tag_ids: tombstoned_content.tag_ids,
        slide_paths: tombstoned_content.slide_paths,
        suggested_caption: tombstoned_content.suggested_caption,
        meme_attachments: tombstoned_content.meme_attachments,
        sequence_number: tombstoned_content.sequence_number,
        used_at: tombstoned_content.used_at,
        like_count: tombstoned_content.like_count,
        comment_count: tombstoned_content.comment_count,
        stats_last_updated_at: tombstoned_content.stats_last_updated_at,
        instagram_post_url: tombstoned_content.instagram_post_url,
        ..Default::default()
    };

    db.fluent()
        .update()
        .fields(paths!(Confession::{
            status, text, admin_message, image_link, tag_ids,
            slide_paths, suggested_caption, meme_attachments,
            sequence_number, used_at, like_count, comment_count,
            stats_last_updated_at, instagram_post_url
        }))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}

/// Zet een tombstoned confession terug op "new" met de originele tekst uit de
/// Sheet (issue #100) - alsof ze net opnieuw gesynct is. Volgnummer, tags,
/// gegenereerde afbeeldingen en stats blijven gewist; die worden pas opnieuw
/// aangemaakt via de normale flow.
pub async fn restore_confession(
    db: &FirestoreDb,
    confession_id: &str,
    row: &RawConfessionRow,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession {
        status: "new".to_string(),
        text: row.text.clone(),
        admin_message: row.admin_message.clone(),
        image_link: row.image_link.clone(),
        ..Default::default()
    };

    db.fluent()
        .update()
        .fields(paths!(Confession::{status, text, admin_message, image_link}))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}

pub async fn save_generated_images(
    db: &FirestoreDb,
    confession_id: &str,
    slide_paths: &[String],
    suggested_caption: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession {
        suggested_caption: Some(suggested_caption.to_string()),
        slide_paths: slide_paths.to_vec(),
        ..Default::default()
    };

    db.fluent()
        .update()
        .fields(paths!(Confession::{suggested_caption, slide_paths}))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}

/// Slaat de eigen kopie(ën) van de meme(s) op (issue #38b) nadat die van Drive
/// gehaald en naar Storage geüpload zijn.
pub async fn save_memes(
    db: &FirestoreDb,
    confession_id: &str,
    meme_attachments: Vec<MemeAttachment>,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession {
        meme_attachments,
        ..Default::default()
    };

    db.fluent()
        .update()
        .fields(paths!(Confession::{meme_attachments}))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}

#[derive(Debug, Deserialize)]
struct ConfessionSequenceNumberOnly {
    sequence_number: Option<u32>,
}

pub async fn fetch_used_sequence_numbers(
    db: &FirestoreDb,
) -> Result<Vec<u32>, Box<dyn std::error::Error>> {
    let number_stream: BoxStream<ConfessionSequenceNumberOnly> = db
        .fluent()
        .select()
        .fields(paths!(ConfessionSequenceNumberOnly::{sequence_number}))
        .from(CONFESSIONS_COLLECTION)
        .filter(|filter_builder| {
            filter_builder.for_all([filter_builder.field(path!(Confession::status)).eq("used")])
        })
        .obj()
        .stream_query()
        .await?;

    let all_entries: Vec<ConfessionSequenceNumberOnly> = number_stream.collect().await;

    let sequence_numbers: Vec<u32> = all_entries
        .into_iter()
        .filter_map(|entry| entry.sequence_number)
        .collect();

    Ok(sequence_numbers)
}

pub async fn mark_confession_as_used(
    db: &FirestoreDb,
    confession_id: &str,
    sequence_number: u32,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession {
        status: "used".to_string(),
        sequence_number: Some(sequence_number),
        used_at: Some(Utc::now()),
        ..Default::default()
    };

    db.fluent()
        .update()
        .fields(paths!(Confession::{status, sequence_number, used_at}))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}

/// Geeft het volgnummer vrij en zet de confession terug op "new" (issue #97) -
/// voor per ongeluk op "Markeer als gebruikt" klikken. used_at wordt ook gewist,
/// want die confession is niet meer "gebruikt" geweest.
pub async fn unmark_confession_as_used(db: &FirestoreDb, confession_id: &str) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession { status: "new".to_string(), sequence_number: None, used_at: None, ..Default::default() };

    db.fluent()
        .update()
        .fields(paths!(Confession::{status, sequence_number, used_at}))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}

/// Wist de slide-referenties nadat hun Storage-objecten opgeruimd zijn (issue #61).
/// used_at blijft staan - dat is de historische "wanneer gepubliceerd"-info, geen
/// vervaldatum om te resetten.
pub async fn clear_slide_paths(
    db: &FirestoreDb,
    confession_id: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession::default();

    db.fluent()
        .update()
        .fields(paths!(Confession::{slide_paths}))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}

/// Werkt like/comment-aantallen en de Instagram-link manueel bij (issues #30/#90).
/// stats_last_updated_at wordt automatisch gezet - niet iets wat de admin zelf invult.
/// instagram_post_url wordt telkens volledig overschreven (net als like/comment_count) -
/// de frontend stuurt steeds de huidige stand van alle drie samen mee, geen gedeeltelijke
/// merge nodig.
pub async fn update_confession_stats(
    db: &FirestoreDb,
    confession_id: &str,
    like_count: u32,
    comment_count: u32,
    instagram_post_url: Option<String>,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession {
        like_count: Some(like_count),
        comment_count: Some(comment_count),
        stats_last_updated_at: Some(Utc::now()),
        instagram_post_url,
        ..Default::default()
    };

    db.fluent()
        .update()
        .fields(paths!(Confession::{like_count, comment_count, stats_last_updated_at, instagram_post_url}))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}
