use crate::model::sheets::RawConfessionRow;
use std::collections::HashSet;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

pub fn calculate_confession_id(timestamp: &str, text: &str) -> String {
    let mut hasher = DefaultHasher::new();
    text.hash(&mut hasher);
    let text_hash = hasher.finish();
    format!("{timestamp}-{text_hash}")
}

/// Houdt enkel de rijen over die nog niet in Firestore staan (nieuw of tombstone).
pub fn filter_new_rows(
    rows: Vec<RawConfessionRow>,
    existing_ids: &HashSet<String>,
) -> Vec<RawConfessionRow> {
    rows.into_iter()
        .filter(|row| is_new_row(row, existing_ids))
        .collect()
}

fn is_new_row(row: &RawConfessionRow, existing_ids: &HashSet<String>) -> bool {
    let id = calculate_confession_id(&row.timestamp, &row.text);
    !existing_ids.contains(&id)
}