
pub fn split_text_into_slides(text: &str, max_chars_per_slide: usize) -> Vec<String> {
    let paragraphs = split_into_paragraphs(text);
    pack_into_slides(&paragraphs, max_chars_per_slide)
}

fn split_into_paragraphs(text: &str) -> Vec<String> {
    text.split("\n\n")
        .map(|paragraph| paragraph.trim().to_string())
        .filter(|paragraph| !paragraph.is_empty())
        .collect()
}

fn pack_into_slides(paragraphs: &[String], max_chars_per_slide: usize) -> Vec<String> {
    let mut slides = Vec::new();
    let mut current_slide = String::new();

    for paragraph in paragraphs {
        if paragraph.chars().count() > max_chars_per_slide {
            flush(&mut slides, &mut current_slide);
            let mut parts = split_oversized_paragraph(paragraph, max_chars_per_slide);
            slides.append(&mut parts);
            continue;
        }

        let fits_in_current_slide = fits(&current_slide, paragraph, "\n\n", max_chars_per_slide);
        if !current_slide.is_empty() && !fits_in_current_slide {
            flush(&mut slides, &mut current_slide);
        }

        add_piece(&mut current_slide, paragraph, "\n\n");
    }

    flush(&mut slides, &mut current_slide);
    slides
}


fn split_oversized_paragraph(paragraph: &str, max_chars_per_slide: usize) -> Vec<String> {
    let mut parts = Vec::new();
    let mut remaining = paragraph.trim().to_string();

    while remaining.chars().count() > max_chars_per_slide {
        let split_byte_index = find_best_split_point(&remaining, max_chars_per_slide);
        let piece = remaining[..split_byte_index].trim().to_string();
        let rest = remaining[split_byte_index..].trim_start().to_string();
        parts.push(piece);
        remaining = rest;
    }

    if !remaining.is_empty() {
        parts.push(remaining);
    }

    parts
}

fn find_best_split_point(text: &str, max_chars: usize) -> usize {
    if let Some(index) = find_last_sentence_end_before_limit(text, max_chars) {
        return index;
    }
    if let Some(index) = find_last_space_before_limit(text, max_chars) {
        return index;
    }
    char_boundary_at(text, max_chars)
}

fn find_last_sentence_end_before_limit(text: &str, max_chars: usize) -> Option<usize> {
    text.char_indices()
        .take(max_chars)
        .filter(|(_, character)| matches!(character, '.' | '!' | '?'))
        .map(|(index, character)| index + character.len_utf8())
        .last()
}

fn find_last_space_before_limit(text: &str, max_chars: usize) -> Option<usize> {
    text.char_indices()
        .take(max_chars)
        .filter(|(_, character)| *character == ' ')
        .map(|(index, _)| index)
        .last()
}

fn char_boundary_at(text: &str, max_chars: usize) -> usize {
    text.char_indices()
        .nth(max_chars)
        .map(|(index, _)| index)
        .unwrap_or(text.len())
}

fn fits(existing: &str, piece: &str, separator: &str, max_chars: usize) -> bool {
    let separator_len = if existing.is_empty() { 0 } else { separator.chars().count() };
    let combined_length = existing.chars().count() + separator_len + piece.chars().count();
    combined_length <= max_chars
}

fn add_piece(existing: &mut String, piece: &str, separator: &str) {
    if !existing.is_empty() {
        existing.push_str(separator);
    }
    existing.push_str(piece);
}

fn flush(slides: &mut Vec<String>, current: &mut String) {
    if !current.is_empty() {
        slides.push(current.clone());
        current.clear();
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn short_text_stays_one_slide() {
        let slides = split_text_into_slides("Dit is een korte confession.", 100);
        assert_eq!(slides, vec!["Dit is een korte confession."]);
    }

    #[test]
    fn paragraphs_split_when_limit_exceeded() {
        let text = "Eerste alinea.\n\nTweede alinea.";
        let slides = split_text_into_slides(text, 20);
        assert_eq!(slides, vec!["Eerste alinea.", "Tweede alinea."]);
    }

    #[test]
    fn oversized_paragraph_splits_after_sentence_not_mid_sentence() {
        let text = "Dit is zin een. Dit is zin twee. Dit is zin drie.";
        let slides = split_text_into_slides(text, 20);
        assert_eq!(slides, vec!["Dit is zin een.", "Dit is zin twee.", "Dit is zin drie."]);
    }

    #[test]
    fn falls_back_to_word_boundary_without_sentence_end() {
        let text = "een twee drie vier vijf";
        let slides = split_text_into_slides(text, 10);
        assert_eq!(slides, vec!["een twee", "drie vier", "vijf"]);
    }
}