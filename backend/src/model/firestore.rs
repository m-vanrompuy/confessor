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

