use firestore::FirestoreDb;
use firestore::paths;
use serde::{Deserialize, Serialize};

pub const SETTINGS_COLLECTION: &str = "settings";

#[derive(Debug, Serialize, Deserialize)]
pub struct Setting {
    #[serde(alias = "_firestore_id")]
    pub key: Option<String>,
    pub value: String,
}

pub async fn get_setting(
    db: &FirestoreDb,
    key: &str,
) -> Result<Option<String>, Box<dyn std::error::Error>> {
    let setting: Option<Setting> = db
        .fluent()
        .select()
        .by_id_in(SETTINGS_COLLECTION)
        .obj()
        .one(key)
        .await?;

    Ok(setting.map(|setting| setting.value))
}

pub async fn set_setting(
    db: &FirestoreDb,
    key: &str,
    value: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let setting = Setting {
        key: None,
        value: value.to_string(),
    };

    db.fluent()
        .update()
        .fields(paths!(Setting::{value}))
        .in_col(SETTINGS_COLLECTION)
        .document_id(key)
        .object(&setting)
        .execute::<Setting>()
        .await?;

    Ok(())
}

pub const TEMPLATE_CONFIG_COLLECTION: &str = "template_config";
const TEMPLATE_CONFIG_DOCUMENT_ID: &str = "config";

#[derive(Debug, Serialize, Deserialize)]
pub struct TemplateConfig {
    pub font_family: String,
    pub font_size: u32,
    pub text_color: String,
    pub max_chars_per_slide: u32,
}

pub async fn get_template_config(
    db: &FirestoreDb,
) -> Result<Option<TemplateConfig>, Box<dyn std::error::Error>> {
    let config: Option<TemplateConfig> = db
        .fluent()
        .select()
        .by_id_in(TEMPLATE_CONFIG_COLLECTION)
        .obj()
        .one(TEMPLATE_CONFIG_DOCUMENT_ID)
        .await?;

    Ok(config)
}

pub async fn save_template_config(
    db: &FirestoreDb,
    config: &TemplateConfig,
) -> Result<(), Box<dyn std::error::Error>> {
    db.fluent()
        .update()
        .in_col(TEMPLATE_CONFIG_COLLECTION)
        .document_id(TEMPLATE_CONFIG_DOCUMENT_ID)
        .object(config)
        .execute::<TemplateConfig>()
        .await?;

    Ok(())
}