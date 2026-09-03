
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
        if effective_width(paragraph) > max_chars_per_slide as f64 {
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

    while effective_width(&remaining) > max_chars_per_slide as f64 {
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

/// Hoe dicht een zin-eind-splitsing minstens bij de limiet moet liggen om ze te
/// verkiezen boven een woordgrens-splitsing. Zonder deze grens koos
/// find_best_split_point de LAATSTE punt/uitroep-/vraagteken binnen de limiet,
/// ook als dat ver onder de limiet lag (issue #125) - een tekst met een lang
/// stuk zonder punctuatie liet daardoor een slide voor een groot deel leeg,
/// met een extra slide tot gevolg die niet nodig was.
const MIN_SENTENCE_SPLIT_FILL_RATIO: f64 = 0.7;

fn find_best_split_point(text: &str, max_chars: usize) -> usize {
    if let Some(index) = find_last_sentence_end_before_limit(text, max_chars) {
        let fill_ratio = effective_width(&text[..index]) / max_chars as f64;
        if fill_ratio >= MIN_SENTENCE_SPLIT_FILL_RATIO {
            return index;
        }
    }
    if let Some(index) = find_last_space_before_limit(text, max_chars) {
        return index;
    }
    char_boundary_at(text, max_chars)
}

fn find_last_sentence_end_before_limit(text: &str, max_chars: usize) -> Option<usize> {
    indices_within_width_limit(text, max_chars)
        .filter(|(_, character)| matches!(character, '.' | '!' | '?'))
        .map(|(index, character)| index + character.len_utf8())
        .last()
}

fn find_last_space_before_limit(text: &str, max_chars: usize) -> Option<usize> {
    indices_within_width_limit(text, max_chars)
        .filter(|(_, character)| *character == ' ')
        .map(|(index, _)| index)
        .last()
}

/// Byte-index net voorbij het laatste teken dat nog binnen het gewogen budget
/// past. Neemt altijd minstens één teken mee, ook als dat ene teken (bv. een
/// brede emoji) het budget alleen al overschrijdt - anders zou de aanroepende
/// while-loop in split_oversized_paragraph nooit vooruitgang boeken.
fn char_boundary_at(text: &str, max_chars: usize) -> usize {
    let within_budget = indices_within_width_limit(text, max_chars)
        .last()
        .map(|(index, character)| index + character.len_utf8());

    within_budget.unwrap_or_else(|| text.chars().next().map_or(0, char::len_utf8))
}

/// Loopt door de tekens van `text` en houdt de cumulatieve gewogen breedte bij
/// (zie char_width_weight) - geeft enkel de tekens terug die nog binnen
/// `max_chars` passen. Vervangt een simpele `.take(max_chars)` (rauwe
/// teken-telling), want die behandelde een brede emoji als even breed als een
/// letter (issue #125).
fn indices_within_width_limit(text: &str, max_chars: usize) -> impl Iterator<Item = (usize, char)> + '_ {
    let mut cumulative_width = 0.0;
    text.char_indices().take_while(move |(_, character)| {
        cumulative_width += char_width_weight(*character);
        cumulative_width <= max_chars as f64
    })
}

fn fits(existing: &str, piece: &str, separator: &str, max_chars: usize) -> bool {
    let separator_width = if existing.is_empty() { 0.0 } else { effective_width(separator) };
    let combined_width = effective_width(existing) + separator_width + effective_width(piece);
    combined_width <= max_chars as f64
}

/// Emoji zijn visueel veel breder dan een letter - vandaar een hoger gewicht
/// dan de standaard 1 teken/eenheid. Verhouding afgestemd op
/// EMOJI_ADVANCE_WIDTH_RATIO/AVERAGE_CHAR_WIDTH_RATIO in image_render.rs
/// (1.3/0.55 ≈ 2.4), naar boven afgerond zodat we eerder te vroeg dan te laat
/// afbreken - anders kan de effectieve rendering weer breder uitvallen dan
/// waar de wrapping hier rekening mee hield.
const EMOJI_WIDTH_WEIGHT: f64 = 2.5;

fn char_width_weight(ch: char) -> f64 {
    if is_emoji_char(ch) { EMOJI_WIDTH_WEIGHT } else { 1.0 }
}

fn effective_width(text: &str) -> f64 {
    text.chars().map(char_width_weight).sum()
}

/// Herkent de gangbare emoji-Unicode-blokken, incl. variatieselector (voor
/// emoji-presentatie van bv. ☺) en zero-width joiner (samengestelde emoji zoals
/// gezinnen). Geen volledig sluitende emoji-detectie (skin-tone-modifiers,
/// vlag-sequenties, ... zitten er niet allemaal in), maar dekt de gangbare
/// gevallen die in confession-tekst voorkomen. Gedeeld met image_render.rs
/// (voor het scheiden van tekst/emoji-segmenten bij het renderen).
pub fn is_emoji_char(ch: char) -> bool {
    let code = ch as u32;
    matches!(code,
        0x1F300..=0x1FAFF // emoticons, symbolen, pictogrammen, transport, ...
        | 0x2600..=0x27BF // diverse symbolen + dingbats (bv. ☺ ✨ ❤)
        | 0x2B00..=0x2BFF // diverse symbolen/pijlen (bv. ⭐)
        | 0x1F1E6..=0x1F1FF // regionale indicators (vlaggen)
        | 0xFE0F // variatieselector-16 (dwingt emoji-presentatie af)
        | 0x200D // zero-width joiner (samengestelde emoji)
    )
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

pub fn wrap_paragraph_into_lines(text: &str, max_chars_per_line: usize) -> Vec<String> {
    let paragraphs = split_into_paragraphs(text);
    let mut lines = Vec::new();

    for paragraph in paragraphs {
        let mut paragraph_lines = wrap_on_word_boundary(&paragraph, max_chars_per_line);
        lines.append(&mut paragraph_lines);
    }

    lines
}

fn wrap_on_word_boundary(text: &str, max_chars_per_line: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut current_line = String::new();

    for word in text.split_whitespace() {
        let fits_in_current_line = fits(&current_line, word, " ", max_chars_per_line);
        if !current_line.is_empty() && !fits_in_current_line {
            flush(&mut lines, &mut current_line);
        }
        add_piece(&mut current_line, word, " ");
    }

    flush(&mut lines, &mut current_line);
    lines
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

    #[test]
    fn wrap_fills_lines_fully_even_with_early_period() {
        let text = "tijdje kwijt wil. Het begon allemaal op een gewone dinsdag.";
        let lines = wrap_paragraph_into_lines(text, 40);
        assert_eq!(lines[0], "tijdje kwijt wil. Het begon allemaal op");
    }

    #[test]
    fn emoji_counts_as_wider_than_a_regular_character_when_wrapping() {
        // 3 emoji (gewicht 2 elk = 6) + "ab" (2) = 8 effectieve eenheden, past
        // dus niet meer op een regel van 7 - zou bij rauwe teken-telling (5
        // "tekens": 3 emoji + 2 letters) wel gepast hebben.
        let text = "ab 😭😭😭";
        let lines = wrap_paragraph_into_lines(text, 7);
        assert_eq!(lines.len(), 2, "emoji moeten zwaarder wegen dan gewone tekens: {lines:?}");
    }

    #[test]
    fn skips_a_sentence_end_split_that_is_too_far_below_the_limit() {
        // De laatste "!" binnen de limiet ligt op teken 5 (ver onder de 20),
        // gevolgd door een lang punctuatieloos stuk - moet terugvallen op de
        // woordgrens-splitsing i.p.v. daar al af te breken.
        let text = "Hoi! dit is een lang stuk tekst zonder verdere punctuatie hier";
        let slides = split_text_into_slides(text, 20);
        assert_ne!(slides[0], "Hoi!", "een zin-eind ver onder de limiet mag niet gekozen worden: {slides:?}");
    }

    #[test]
    fn a_real_confession_with_emoji_splits_into_two_slides_not_three() {
        // Issue #125 - dit precieze voorbeeld brak voorheen in 3 slides i.p.v. 2:
        // slide 1 stopte veel te vroeg bij een zin-eind, en de emoji werden als
        // 3 gewone tekens meegeteld i.p.v. als brede tekens.
        let text = "Hallo liefste Niels! (Ik ken er wel maar één, dus helaas geen grote egoboost) Het is om te zeggen dat het pompbak is, met een extra p'tje. Wel kudo's voor de mooie alliteratie! (Ik gebruik 'kudo's' omdat ik een knieblessure heb en niet mag lopen (en niet eens hakken mag aandoen🤯🤯🤯) en uitermate gefrustreerd ben, dus dit is een verwijzing naar strava, weer heel graag gedaan voor deze info) Doeiiiii van de beste en meest bescheiden spellingchecker uit Leuven die duidelijk zeer moe is :)))";
        let slides = split_text_into_slides(text, 280);
        assert_eq!(slides.len(), 2, "verwacht 2 slides, kreeg {}: {slides:?}", slides.len());
    }

    #[test]
    fn wrap_forces_new_line_on_paragraph_break() {
        let text = "Eerste alinea kort.\n\nTweede alinea kort.";
        let lines = wrap_paragraph_into_lines(text, 100);
        assert_eq!(lines, vec!["Eerste alinea kort.", "Tweede alinea kort."]);
    }
}