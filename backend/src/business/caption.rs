use crate::business::title::generate_title;

/// Stelt een Instagram-caption voor: het volgnummer plus een korte teaser van de tekst.
/// Enkel een voorstel - de admin kan dit voor het posten nog aanpassen.
pub fn suggest_caption(sequence_number: u32, text: &str, max_teaser_length: usize) -> String {
    let teaser = generate_title(text, max_teaser_length);
    format!("Confession #{sequence_number}\n\n{teaser}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn includes_sequence_number_and_teaser() {
        let caption = suggest_caption(4200, "Dit is een korte confession.", 100);
        assert_eq!(caption, "Confession #4200\n\nDit is een korte confession.");
    }

    #[test]
    fn truncates_long_text_like_a_title() {
        let long_text = "een twee drie vier vijf zes zeven acht negen tien";
        let caption = suggest_caption(1, long_text, 20);
        assert_eq!(caption, "Confession #1\n\neen twee drie vier…");
    }
}
