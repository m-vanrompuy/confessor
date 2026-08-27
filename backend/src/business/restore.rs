use crate::business::dedupe::calculate_confession_id;
use crate::model::sheets::RawConfessionRow;

/// Zoekt de originele Sheet-rij die bij dit confession-ID hoort (issue #100).
/// Nodig om een tombstoned confession te herstellen: delete wist text/
/// admin_message/image_link in Firestore, maar raakt de Sheet nooit aan - dus het
/// ID (berekend uit timestamp + tekst) is nog steeds de sleutel om de rij terug te
/// vinden, zelfde functie als sync al gebruikt voor dedupe.
pub fn find_matching_row<'a>(rows: &'a [RawConfessionRow], confession_id: &str) -> Option<&'a RawConfessionRow> {
    rows.iter().find(|row| calculate_confession_id(&row.timestamp, &row.text) == confession_id)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn row(timestamp: &str, text: &str) -> RawConfessionRow {
        RawConfessionRow { timestamp: timestamp.to_string(), text: text.to_string(), image_link: None, admin_message: None }
    }

    #[test]
    fn finds_the_row_whose_recomputed_id_matches() {
        let rows = vec![row("1-1-2026 10:00:00", "eerste"), row("1-1-2026 11:00:00", "tweede")];
        let target_id = calculate_confession_id("1-1-2026 11:00:00", "tweede");

        let found = find_matching_row(&rows, &target_id);

        assert_eq!(found.map(|row| row.text.as_str()), Some("tweede"));
    }

    #[test]
    fn returns_none_when_no_row_matches() {
        let rows = vec![row("1-1-2026 10:00:00", "eerste")];
        let found = find_matching_row(&rows, "does-not-exist");
        assert!(found.is_none());
    }
}
