//! Business logic-laag: regels voor het toewijzen van tags aan een confession.

use std::collections::HashSet;

/// Verwijdert dubbele tag-ID's uit de lijst, met behoud van de originele volgorde.
pub fn dedupe_tag_ids(tag_ids: Vec<String>) -> Vec<String> {
    let mut seen_ids = HashSet::new();
    let mut deduped_ids = Vec::new();

    for tag_id in tag_ids {
        if seen_ids.insert(tag_id.clone()) {
            deduped_ids.push(tag_id);
        }
    }

    deduped_ids
}
