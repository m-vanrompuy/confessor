use crate::business::dedupe::calculate_confession_id;
use crate::model::sheets::RawConfessionRow;
use firestore::FirestoreDb;
use firestore::paths;
use firestore::path;
use firestore::FirestoreQueryFilter;
use firestore::select_filter_builder::FirestoreQueryFilterBuilder;
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
    #[serde(default)]
    pub tag_ids: Vec<String>,
    #[serde(default)]
    pub sequence_number: Option<u32>,
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

pub async fn make_firestore_client() -> Result<FirestoreDb, Box<dyn std::error::Error>> {
    let db = FirestoreDb::new(PROJECT_ID).await?;
    Ok(db)
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
        tag_ids: Vec::new(),
        sequence_number: None,
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

pub const TAGS_COLLECTION: &str = "tags";

#[derive(Debug, Serialize, Deserialize)]
pub struct Tag {
    #[serde(alias = "_firestore_id")]
    pub id: Option<String>,
    pub name: String,
    pub color: String,
}

pub async fn create_tag(
    db: &FirestoreDb,
    name: &str,
    color: &str,
) -> Result<Tag, Box<dyn std::error::Error>> {
    let new_tag = Tag {
        id: None,
        name: name.to_string(),
        color: color.to_string(),
    };

    let saved_tag = db
        .fluent()
        .insert()
        .into(TAGS_COLLECTION)
        .generate_document_id()
        .object(&new_tag)
        .execute::<Tag>()
        .await?;

    Ok(saved_tag)
}

pub async fn rename_tag(
    db: &FirestoreDb,
    tag_id: &str,
    new_name: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_tag = Tag {
        id: None,
        name: new_name.to_string(),
        color: String::new(),
    };

    db.fluent()
        .update()
        .fields(paths!(Tag::{name}))
        .in_col(TAGS_COLLECTION)
        .document_id(tag_id)
        .object(&placeholder_tag)
        .execute::<Tag>()
        .await?;

    Ok(())
}

pub async fn set_tag_color(
    db: &FirestoreDb,
    tag_id: &str,
    new_color: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_tag = Tag {
        id: None,
        name: String::new(),
        color: new_color.to_string(),
    };

    db.fluent()
        .update()
        .fields(paths!(Tag::{color}))
        .in_col(TAGS_COLLECTION)
        .document_id(tag_id)
        .object(&placeholder_tag)
        .execute::<Tag>()
        .await?;

    Ok(())
}

pub async fn delete_tag(
    db: &FirestoreDb,
    tag_id: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    db.fluent()
        .delete()
        .from(TAGS_COLLECTION)
        .document_id(tag_id)
        .execute()
        .await?;

    Ok(())
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
        id: String::new(),
        timestamp: String::new(),
        title: String::new(),
        text: String::new(),
        admin_message: None,
        image_link: None,
        status: String::new(),
        tag_ids: tag_ids.to_vec(),
        sequence_number: None,
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

/// Verwijdert een confession volgens het tombstone-pattern: enkel het document-ID
/// blijft ongewijzigd, alle inhoud wordt gewist (zie business::tombstone).
pub async fn delete_confession(
    db: &FirestoreDb,
    confession_id: &str,
    tombstoned_content: crate::business::tombstone::TombstonedContent,
) -> Result<(), Box<dyn std::error::Error>> {
    let placeholder_confession = Confession {
        id: String::new(),
        timestamp: String::new(),
        title: tombstoned_content.title,
        text: tombstoned_content.text,
        admin_message: tombstoned_content.admin_message,
        image_link: tombstoned_content.image_link,
        status: tombstoned_content.status,
        tag_ids: tombstoned_content.tag_ids,
        sequence_number: None,
    };

    db.fluent()
        .update()
        .fields(paths!(Confession::{title, text, admin_message, image_link, status, tag_ids}))
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
        id: String::new(),
        timestamp: String::new(),
        title: String::new(),
        text: String::new(),
        admin_message: None,
        image_link: None,
        status: "used".to_string(),
        tag_ids: Vec::new(),
        sequence_number: Some(sequence_number),
    };

    db.fluent()
        .update()
        .fields(paths!(Confession::{status, sequence_number}))
        .in_col(CONFESSIONS_COLLECTION)
        .document_id(confession_id)
        .object(&placeholder_confession)
        .execute::<Confession>()
        .await?;

    Ok(())
}