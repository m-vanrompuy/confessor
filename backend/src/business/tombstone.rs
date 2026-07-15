pub struct TombstonedContent {
    pub title: String,
    pub text: String,
    pub admin_message: Option<String>,
    pub image_link: Option<String>,
    pub tag_ids: Vec<String>,
    pub status: String,
}

pub fn build_tombstoned_content() -> TombstonedContent {
    TombstonedContent {
        title: String::new(),
        text: String::new(),
        admin_message: None,
        image_link: None,
        tag_ids: Vec::new(),
        status: "deleted".to_string(),
    }
}
