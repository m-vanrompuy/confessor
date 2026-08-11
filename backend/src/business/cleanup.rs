use crate::model::firestore::Confession;
use chrono::{DateTime, Utc};

/// Confessions waarvan de afbeeldingen ouder zijn dan de bewaartermijn - en die nog
/// effectief slide_paths hebben om op te ruimen (anders is er niets te doen).
pub fn find_expired_confessions<'a>(
    confessions: &'a [Confession],
    retention_days: u32,
    now: DateTime<Utc>,
) -> Vec<&'a Confession> {
    confessions
        .iter()
        .filter(|confession| is_expired(confession, retention_days, now))
        .collect()
}

fn is_expired(confession: &Confession, retention_days: u32, now: DateTime<Utc>) -> bool {
    if confession.slide_paths.is_empty() {
        return false;
    }

    match confession.used_at {
        Some(used_at) => days_since(used_at, now) >= retention_days as i64,
        None => false,
    }
}

fn days_since(moment: DateTime<Utc>, now: DateTime<Utc>) -> i64 {
    now.signed_duration_since(moment).num_days()
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration;

    fn confession_used_days_ago(days_ago: i64, now: DateTime<Utc>) -> Confession {
        Confession {
            id: "test-id".to_string(),
            timestamp: String::new(),
            title: String::new(),
            text: String::new(),
            admin_message: None,
            image_link: None,
            status: "used".to_string(),
            tag_ids: Vec::new(),
            sequence_number: Some(1),
            suggested_caption: None,
            slide_paths: vec!["confessions/test-id/slide-1.png".to_string()],
            used_at: Some(now - Duration::days(days_ago)),
        }
    }

    #[test]
    fn confession_older_than_retention_is_expired() {
        let now = Utc::now();
        let confession = confession_used_days_ago(31, now);
        let confessions = [confession];
        let expired = find_expired_confessions(&confessions, 30, now);
        assert_eq!(expired.len(), 1);
    }

    #[test]
    fn confession_within_retention_is_not_expired() {
        let now = Utc::now();
        let confession = confession_used_days_ago(10, now);
        let confessions = [confession];
        let expired = find_expired_confessions(&confessions, 30, now);
        assert!(expired.is_empty());
    }

    #[test]
    fn confession_without_slide_paths_is_never_expired() {
        let now = Utc::now();
        let mut confession = confession_used_days_ago(100, now);
        confession.slide_paths = Vec::new();
        let confessions = [confession];
        let expired = find_expired_confessions(&confessions, 30, now);
        assert!(expired.is_empty());
    }

    #[test]
    fn confession_without_used_at_is_never_expired() {
        let now = Utc::now();
        let mut confession = confession_used_days_ago(100, now);
        confession.used_at = None;
        let confessions = [confession];
        let expired = find_expired_confessions(&confessions, 30, now);
        assert!(expired.is_empty());
    }
}
