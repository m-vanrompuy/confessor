use firestore::FirestoreDb;
use firestore::paths;
use serde::{Deserialize, Serialize};

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