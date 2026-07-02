use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

/// Combinatie van tijdstempel + hash van de tekst,
pub fn calculate_confession_id(tijdstempel: &str, tekst: &str) -> String {
    let mut hasher = DefaultHasher::new();
    tekst.hash(&mut hasher);
    let hash = hasher.finish();

    format!("{tijdstempel}-{hash}")
}