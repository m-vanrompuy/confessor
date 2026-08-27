use crate::model::firestore::Confession;
use crate::model::firestore::MemeAttachment;
use chrono::DateTime;
use chrono::Utc;

/// Alle velden die een verwijderde confession wist. `title` zit hier bewust niet
/// bij - dat blijft behouden, anders is een confession in de Prullenmand niet meer
/// te identificeren (issue #99). Verder wordt alles gewist: de tekst zelf, de
/// gegenereerde afbeeldingen, het toegekende volgnummer, en de statistieken - een
/// verwijderde confession mag geen volgnummer of gepubliceerde stats blijven
/// vasthouden.
pub struct TombstonedContent {
    pub status: String,
    pub text: String,
    pub admin_message: Option<String>,
    pub image_link: Option<String>,
    pub tag_ids: Vec<String>,
    pub slide_paths: Vec<String>,
    pub suggested_caption: Option<String>,
    pub meme_attachments: Vec<MemeAttachment>,
    pub sequence_number: Option<u32>,
    pub used_at: Option<DateTime<Utc>>,
    pub like_count: Option<u32>,
    pub comment_count: Option<u32>,
    pub stats_last_updated_at: Option<DateTime<Utc>>,
    pub instagram_post_url: Option<String>,
}

pub fn build_tombstoned_content() -> TombstonedContent {
    TombstonedContent {
        status: "deleted".to_string(),
        text: String::new(),
        admin_message: None,
        image_link: None,
        tag_ids: Vec::new(),
        slide_paths: Vec::new(),
        suggested_caption: None,
        meme_attachments: Vec::new(),
        sequence_number: None,
        used_at: None,
        like_count: None,
        comment_count: None,
        stats_last_updated_at: None,
        instagram_post_url: None,
    }
}

/// Storage-objecten die samen met de confession-inhoud verwijderd moeten worden:
/// de gerenderde slides én de originele meme-bijlagen. Pure functie - de effectieve
/// I/O (storage::delete_object) gebeurt in routes/confessions.rs, vóór de
/// Firestore-tombstone geschreven wordt.
pub fn storage_paths_to_delete(confession: &Confession) -> Vec<String> {
    let slide_paths = confession.slide_paths.iter().cloned();
    let meme_paths = confession.meme_attachments.iter().map(|meme| meme.storage_path.clone());
    slide_paths.chain(meme_paths).collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tombstoned_content_wipes_every_generated_and_published_field() {
        let content = build_tombstoned_content();

        assert_eq!(content.status, "deleted");
        assert_eq!(content.text, "");
        assert!(content.admin_message.is_none());
        assert!(content.image_link.is_none());
        assert!(content.tag_ids.is_empty());
        assert!(content.slide_paths.is_empty());
        assert!(content.suggested_caption.is_none());
        assert!(content.meme_attachments.is_empty());
        assert!(content.sequence_number.is_none());
        assert!(content.used_at.is_none());
        assert!(content.like_count.is_none());
        assert!(content.comment_count.is_none());
        assert!(content.stats_last_updated_at.is_none());
        assert!(content.instagram_post_url.is_none());
    }

    #[test]
    fn storage_paths_to_delete_combines_slides_and_memes() {
        let confession = Confession {
            slide_paths: vec!["confessions/x/slide-1.png".to_string(), "confessions/x/slide-2.png".to_string()],
            meme_attachments: vec![MemeAttachment {
                storage_path: "confessions/x/meme-1.jpg".to_string(),
                content_type: "image/jpeg".to_string(),
            }],
            ..Default::default()
        };

        let paths = storage_paths_to_delete(&confession);

        assert_eq!(
            paths,
            vec![
                "confessions/x/slide-1.png".to_string(),
                "confessions/x/slide-2.png".to_string(),
                "confessions/x/meme-1.jpg".to_string(),
            ]
        );
    }

    #[test]
    fn storage_paths_to_delete_is_empty_without_generated_content() {
        let confession = Confession::default();
        assert!(storage_paths_to_delete(&confession).is_empty());
    }
}
