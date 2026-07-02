

pub fn generate_title(full_text: &str, max_length: usize) -> String {
    let clean_text = full_text.trim();

    if text_fits_within_limit(clean_text, max_length) {
        return clean_text.to_string();
    }

    let shortened_text = cut_text_at_word_boundary(clean_text, max_length);
    format!("{shortened_text}…")
}

fn text_fits_within_limit(text: &str, max_length: usize) -> bool {
    text.chars().count() <= max_length
}

fn cut_text_at_word_boundary(text: &str, max_length: usize) -> &str {
    match find_last_space_before_limit(text, max_length) {
        Some(space_index) => &text[..space_index],
        None => &text[..max_length], 
    }
}

fn find_last_space_before_limit(text: &str, max_length: usize) -> Option<usize> {
    text.char_indices()
        .take(max_length)
        .filter(|(_, character)| *character == ' ')
        .map(|(index, _)| index)
        .last()
}