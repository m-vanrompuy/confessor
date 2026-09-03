use base64::Engine;
use std::fs;
use std::path::Path;

const TEMPLATE_PATH: &str = "templates/confession-template.svg";
const TEMPLATES_DIR: &str = "templates";

// --- Template-geometrie -----------------------------------------------------
// Met de hand uitgetest en afgestemd op backend/templates/confession-template.svg.
// Wijzig deze waardes hier EN, indien nodig, de bijhorende x/y in de SVG zelf.
// Dit blok is de enige plek waar de layout-formules staan.

/// Linker-x van de tekstkolom (na de nummer-kolom). De SVG zet zelf geen x meer
/// op het <text>-element; elke regel/segment krijgt deze waarde vanuit
/// build_text_elements.
const TEXT_LEFT_X: f64 = 305.0;

/// Y waar de tekst normaal start (geen meme, of meme staat na de tekst).
const TEXT_START_Y: f64 = 270.0;

/// Het nummer stond van oudsher 15px lager dan de tekst zelf - behouden als vaste
/// relatie, ook nu de tekst zelf kan verschuiven afhankelijk van de meme-positie.
const NUMBER_Y_OFFSET: f64 = 15.0;

/// Breedte/hoogte van de zone waarbinnen tekst moet passen (uitgetest, niet enkel
/// geometrisch gemeten — houdt al rekening met de marge die in de praktijk goed oogt).
const TEXT_AREA_WIDTH_PX: f64 = 740.0;
const TEXT_AREA_HEIGHT_PX: f64 = 710.0;
const CARD_BOTTOM_Y: f64 = TEXT_START_Y + TEXT_AREA_HEIGHT_PX;

/// Vuistregel: gemiddelde tekenbreedte ≈ dit percentage van de font-size (sans-serif Latin).
const AVERAGE_CHAR_WIDTH_RATIO: f64 = 0.55;

/// Regelhoogte t.o.v. de font-size (moet overeenkomen met dy="1.4em" in build_text_elements).
const LINE_HEIGHT_RATIO: f64 = 1.4;

/// Het nummer wordt groter weergegeven dan de body-tekst, vaste verhouding.
const NUMBER_FONT_SIZE_RATIO: f64 = 1.6;

const CANVAS_WIDTH_PX: f64 = 1080.0;

/// Meme-vak op schaal 1.0: breder dan de tekstkolom (spant bijna de volledige
/// kaart), vaste basishoogte. `scale` (issue #65-vervolg) vergroot/verkleint dit
/// vak; de breedte blijft altijd binnen MEME_MAX_WIDTH_PX zodat het nooit buiten
/// de kaart uitsteekt, ook niet bij de grootste toegestane schaal. Bij "na de
/// tekst" krimpt de hoogte bovendien als er niet genoeg ruimte overblijft; bij
/// "voor de tekst" staat het vak vast en schuift de tekst mee.
const MEME_MIN_MARGIN_PX: f64 = 40.0;
const MEME_MAX_WIDTH_PX: f64 = CANVAS_WIDTH_PX - 2.0 * MEME_MIN_MARGIN_PX;
const MEME_BASE_WIDTH_PX: f64 = 920.0;
const MEME_BASE_HEIGHT_PX: f64 = 500.0;
const MEME_GAP_PX: f64 = 40.0;

/// Grenzen voor de instelbare schaalfactor - voorkomt een onleesbaar kleine of
/// een overweldigend grote/afgesneden meme. Wordt ook gebruikt om de query-param
/// te clampen in routes/confessions.rs.
pub const MEME_SCALE_MIN: f64 = 0.5;
pub const MEME_SCALE_MAX: f64 = 1.5;

/// Hoeveel tekens ongeveer op één regel passen bij een gegeven lettergrootte.
pub fn max_chars_per_line(font_size: u32) -> usize {
    (TEXT_AREA_WIDTH_PX / (font_size as f64 * AVERAGE_CHAR_WIDTH_RATIO)) as usize
}

/// Hoeveel tekens ongeveer op één volledige afbeelding passen bij een gegeven lettergrootte.
pub fn max_chars_per_slide(font_size: u32) -> usize {
    let lines_per_slide = TEXT_AREA_HEIGHT_PX / (font_size as f64 * LINE_HEIGHT_RATIO);
    (lines_per_slide * max_chars_per_line(font_size) as f64) as usize
}
// -----------------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MemePosition {
    Before,
    After,
}

/// Meme die in deze specifieke slide gecomponeerd moet worden (issue #65). Enkel
/// gezet op de ene slide van een confession die de meme krijgt - andere slides van
/// dezelfde confession hebben gewoon geen meme.
pub struct MemeInput<'a> {
    pub bytes: &'a [u8],
    pub content_type: &'a str,
    pub position: MemePosition,
    /// 1.0 = standaardgrootte. Wordt al geclamped tussen MEME_SCALE_MIN/MAX vóór
    /// dit punt (zie routes/confessions.rs), maar scaled_meme_box clampt zelf ook
    /// nog eens de breedte - twee onafhankelijke vangnetten tegen een te grote meme.
    pub scale: f64,
}

/// Alle waardes die voor één slide in de SVG-template ingevuld moeten worden.
pub struct SlideRenderInput<'a> {
    pub lines: &'a [String],
    pub sequence_number: u32,
    pub font_family: &'a str,
    pub font_size: u32,
    pub text_color: &'a str,
    pub meme: Option<MemeInput<'a>>,
}

/// Vult de SVG-template in met de gegeven tekst en rendert ze naar PNG-bytes.
pub fn render_slide_to_png(input: &SlideRenderInput) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let template = fs::read_to_string(TEMPLATE_PATH)?;
    let filled_svg = fill_template(&template, input);
    rasterize_svg(&filled_svg)
}

/// Het nummer staat altijd op dezelfde plek, linksboven onder het logo - een vast
/// merk-element, geen deel van de meelopende tekst-flow. Verandert nooit mee met de
/// meme-positie, ook al schuift de tekst zelf wel op (zie compute_layout).
const NUMBER_Y: f64 = TEXT_START_Y + NUMBER_Y_OFFSET;

struct Layout {
    text_y: f64,
    meme_box: Option<MemeBox>,
}

struct MemeBox {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}

fn compute_layout(num_lines: usize, font_size: u32, meme: Option<(MemePosition, f64)>) -> Layout {
    match meme {
        None => Layout { text_y: TEXT_START_Y, meme_box: None },
        Some((MemePosition::Before, scale)) => layout_meme_before(scale),
        Some((MemePosition::After, scale)) => layout_meme_after(num_lines, font_size, scale),
    }
}

/// Meme-vak op de gegeven schaal, horizontaal gecentreerd, breedte geclamped zodat
/// het nooit buiten de kaart uitsteekt ongeacht de schaalfactor.
fn scaled_meme_box(y: f64, scale: f64) -> MemeBox {
    let width = (MEME_BASE_WIDTH_PX * scale).min(MEME_MAX_WIDTH_PX);
    let height = MEME_BASE_HEIGHT_PX * scale;
    let x = (CANVAS_WIDTH_PX - width) / 2.0;
    MemeBox { x, y, width, height }
}

/// Meme staat vast bovenaan de tekstzone, enkel de tekst schuift mee naar onder.
fn layout_meme_before(scale: f64) -> Layout {
    let meme_box = scaled_meme_box(TEXT_START_Y, scale);
    let text_y = TEXT_START_Y + meme_box.height + MEME_GAP_PX;
    Layout { text_y, meme_box: Some(meme_box) }
}

/// Meme staat net onder de effectieve tekst (op basis van het echte aantal regels,
/// niet de volledige toegestane tekstzone) - krimpt als er weinig ruimte overblijft,
/// verdwijnt helemaal als er echt geen plaats meer is (lange tekst + meme samen).
fn layout_meme_after(num_lines: usize, font_size: u32, scale: f64) -> Layout {
    let line_height = font_size as f64 * LINE_HEIGHT_RATIO;
    let text_block_height = num_lines as f64 * line_height;
    let meme_y = TEXT_START_Y + text_block_height + MEME_GAP_PX;

    let mut meme_box = scaled_meme_box(meme_y, scale);
    let available_height = (CARD_BOTTOM_Y - meme_y).max(0.0);
    meme_box.height = meme_box.height.min(available_height);

    let meme_box = if meme_box.height > 0.0 { Some(meme_box) } else { None };

    Layout { text_y: TEXT_START_Y, meme_box }
}

fn fill_template(template: &str, input: &SlideRenderInput) -> String {
    let number_font_size = (input.font_size as f64 * NUMBER_FONT_SIZE_RATIO).round() as u32;
    let meme_placement = input.meme.as_ref().map(|meme| (meme.position, meme.scale));
    let layout = compute_layout(input.lines.len(), input.font_size, meme_placement);

    let (lines_svg, emoji_elements_svg) =
        build_text_elements(input.lines, input.font_family, input.font_size, input.text_color, layout.text_y);

    let meme_element = match (&input.meme, &layout.meme_box) {
        (Some(meme), Some(meme_box)) => build_meme_element(meme, meme_box),
        _ => String::new(),
    };

    template
        .replace("{{LINES}}", &lines_svg)
        .replace("{{EMOJI_ELEMENTS}}", &emoji_elements_svg)
        .replace("{{NUMBER}}", &input.sequence_number.to_string())
        .replace("{{NUMBER_FONT_SIZE}}", &number_font_size.to_string())
        .replace("{{FONT_FAMILY}}", &escape_xml(input.font_family))
        .replace("{{FONT_SIZE}}", &input.font_size.to_string())
        .replace("{{TEXT_COLOR}}", &escape_xml(input.text_color))
        .replace("{{TEXT_Y}}", &layout.text_y.to_string())
        .replace("{{NUMBER_Y}}", &NUMBER_Y.to_string())
        .replace("{{MEME_ELEMENT}}", &meme_element)
}

/// Bouwt de <image>-tag voor de meme als een base64 data-URI, zodat we niets naar
/// schijf moeten schrijven om ze te renderen. `preserveAspectRatio="xMidYMid meet"`
/// laat resvg de originele verhouding bewaren binnen het vak - we hoeven zelf de
/// echte afmetingen van de meme niet te kennen of te berekenen.
fn build_meme_element(meme: &MemeInput, meme_box: &MemeBox) -> String {
    let encoded = base64::engine::general_purpose::STANDARD.encode(meme.bytes);
    let content_type = escape_xml(meme.content_type);

    format!(
        r#"<image href="data:{content_type};base64,{encoded}" x="{}" y="{}" width="{}" height="{}" preserveAspectRatio="xMidYMid meet"/>"#,
        meme_box.x, meme_box.y, meme_box.width, meme_box.height
    )
}

/// Emoji-glyphen zitten niet in het body-lettertype (bv. Liberation Serif).
/// Eerste poging: enkel de emoji naar een ander <tspan> met een eigen
/// font-family sturen, tekst ernaast op het geconfigureerde font laten - bleek
/// NIET te werken. Uitgetest (issue #122-vervolg, losstaande minimale SVG's,
/// buiten deze hele pipeline): usvg 0.47 rendert een volledig <text>-element
/// verkeerd zodra het twee <tspan>'s met VERSCHILLENDE font-families bevat en
/// één daarvan een color-font (Noto Color Emoji) is - ook het <tspan> met het
/// "juiste" font-family krijgt dan een verkeerd (vet/ander) lettertype. Aparte,
/// onafhankelijke <text>-elementen renderden in diezelfde test wel allebei
/// correct. Vandaar: emoji's komen als eigen <text>-elementen buiten de
/// hoofdtekst, met zelf geschatte x/y (zelfde vuistregel-aanpak als
/// max_chars_per_line - geen pixel-perfecte tekstmeting, maar precies genoeg
/// om netjes aan te sluiten).
const EMOJI_FONT_FAMILY: &str = "Noto Color Emoji";

/// Positie + inhoud van één emoji-<text>-element, apart van de hoofdtekst.
struct EmojiElement {
    text: String,
    x: f64,
    y: f64,
}

/// Bouwt zowel de tspans voor de hoofdtekst (binnen het bestaande <text>) als de
/// losse emoji-<text>-elementen. `text_y` is de baseline van de eerste regel
/// (zie Layout::text_y) - nodig om de absolute y van latere regels te berekenen,
/// want emoji-elementen kunnen niet meeliften op SVG's relatieve dy-opstapeling
/// zoals tspans dat wel kunnen.
fn build_text_elements(lines: &[String], font_family: &str, font_size: u32, text_color: &str, text_y: f64) -> (String, String) {
    let escaped_font_family = escape_xml(font_family);
    let char_width = font_size as f64 * AVERAGE_CHAR_WIDTH_RATIO;
    let line_height = font_size as f64 * LINE_HEIGHT_RATIO;

    let mut tspans = String::new();
    let mut emoji_elements: Vec<EmojiElement> = Vec::new();

    for (line_index, line) in lines.iter().enumerate() {
        let line_y = text_y + line_index as f64 * line_height;

        // Elke tspan krijgt zelf een expliciete x ÉN y (geen dy/cumulatieve
        // opstapeling) - uitgetest: een lege "anchor"-tspan die enkel dy zet
        // om de regel te positioneren droeg NIET betrouwbaar over naar het
        // volgende <tspan> in usvg 0.47 (regels vielen over elkaar heen zodra
        // er tussendoor emoji-elementen uit de flow gehaald werden). Volledig
        // expliciete x/y per tspan is voorspelbaarder, ook al kost dat een
        // beetje herhaling.
        let mut cursor_x = TEXT_LEFT_X;
        for segment in split_into_font_segments(line) {
            let segment_char_count = segment.text.chars().count() as f64;

            if segment.is_emoji {
                emoji_elements.push(EmojiElement { text: segment.text, x: cursor_x, y: line_y });
                // Ruwe schatting: een emoji-glyph is ~1em breed.
                cursor_x += segment_char_count * font_size as f64;
            } else {
                let escaped_text = escape_xml(&segment.text);
                tspans.push_str(&format!(
                    r#"<tspan x="{cursor_x}" y="{line_y}" font-family="{escaped_font_family}">{escaped_text}</tspan>"#
                ));
                cursor_x += segment_char_count * char_width;
            }
        }
    }

    let emoji_elements_svg = emoji_elements
        .iter()
        .map(|emoji| build_emoji_text_element(emoji, font_size, text_color))
        .collect::<String>();

    (tspans, emoji_elements_svg)
}

fn build_emoji_text_element(emoji: &EmojiElement, font_size: u32, text_color: &str) -> String {
    format!(
        r#"<text x="{}" y="{}" font-family="{EMOJI_FONT_FAMILY}" font-size="{font_size}" fill="{}" text-anchor="start">{}</text>"#,
        emoji.x,
        emoji.y,
        escape_xml(text_color),
        escape_xml(&emoji.text)
    )
}

struct TextSegment {
    text: String,
    is_emoji: bool,
}

/// Splitst een regel in aaneengesloten stukken tekst vs. emoji.
fn split_into_font_segments(line: &str) -> Vec<TextSegment> {
    let mut segments: Vec<TextSegment> = Vec::new();

    for ch in line.chars() {
        let is_emoji = is_emoji_char(ch);
        match segments.last_mut() {
            Some(last) if last.is_emoji == is_emoji => last.text.push(ch),
            _ => segments.push(TextSegment { text: ch.to_string(), is_emoji }),
        }
    }

    segments
}

/// Herkent de gangbare emoji-Unicode-blokken, incl. variatieselector (voor
/// emoji-presentatie van bv. ☺) en zero-width joiner (samengestelde emoji zoals
/// gezinnen). Geen volledig sluitende emoji-detectie (skin-tone-modifiers,
/// vlag-sequenties, ... zitten er niet allemaal in), maar dekt de gangbare
/// gevallen die in confession-tekst voorkomen.
fn is_emoji_char(ch: char) -> bool {
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

/// Escaped tekst voor gebruik binnen XML/SVG, zodat gebruikersinvoer (bv. "&" of "<")
/// de SVG-structuur niet kan breken.
fn escape_xml(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

pub fn rasterize_svg(svg_content: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let mut options = usvg::Options {
        resources_dir: Some(Path::new(TEMPLATES_DIR).to_path_buf()),
        ..usvg::Options::default()
    };
    options.fontdb_mut().load_system_fonts();

    let tree = usvg::Tree::from_data(svg_content.as_bytes(), &options)?;

    let pixmap_size = tree.size().to_int_size();
    let mut pixmap = tiny_skia::Pixmap::new(pixmap_size.width(), pixmap_size.height())
        .ok_or("kon geen pixmap aanmaken")?;

    resvg::render(&tree, tiny_skia::Transform::default(), &mut pixmap.as_mut());

    let png_bytes = pixmap.encode_png()?;
    Ok(png_bytes)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::business::template::{split_text_into_slides, wrap_paragraph_into_lines};

    #[test]
    fn split_into_font_segments_keeps_plain_text_as_one_segment() {
        let segments = split_into_font_segments("gewone tekst zonder emoji");
        assert_eq!(segments.len(), 1);
        assert!(!segments[0].is_emoji);
        assert_eq!(segments[0].text, "gewone tekst zonder emoji");
    }

    #[test]
    fn split_into_font_segments_isolates_a_trailing_emoji() {
        let segments = split_into_font_segments("normale tekst 😭");
        assert_eq!(segments.len(), 2);
        assert!(!segments[0].is_emoji);
        assert_eq!(segments[0].text, "normale tekst ");
        assert!(segments[1].is_emoji);
        assert_eq!(segments[1].text, "😭");
    }

    #[test]
    fn split_into_font_segments_handles_emoji_in_the_middle() {
        let segments = split_into_font_segments("voor 👀 na");
        assert_eq!(segments.len(), 3);
        assert_eq!(segments[0].text, "voor ");
        assert!(!segments[0].is_emoji);
        assert_eq!(segments[1].text, "👀");
        assert!(segments[1].is_emoji);
        assert_eq!(segments[2].text, " na");
        assert!(!segments[2].is_emoji);
    }

    #[test]
    fn build_text_elements_keeps_the_emoji_out_of_the_main_text_flow() {
        let lines = vec!["blij nu 😭".to_string()];
        let (tspans, emoji_svg) = build_text_elements(&lines, "Liberation Serif", 24, "#000000", 270.0);

        // De emoji zelf mag NIET als tspan in de hoofdtekst zitten - enkel als
        // apart <text>-element (issue #122-vervolg, zie build_text_elements-doc).
        assert!(!tspans.contains('😭'), "emoji hoort niet in de hoofdtekst-tspans: {tspans}");
        assert!(
            tspans.contains(r#"<tspan x="305" y="270" font-family="Liberation Serif">blij nu </tspan>"#),
            "tekst-stuk moet het geconfigureerde font-family houden: {tspans}"
        );
        assert!(
            emoji_svg.contains(&format!(r#"font-family="{EMOJI_FONT_FAMILY}""#)) && emoji_svg.contains('😭'),
            "emoji moet als apart <text>-element met eigen font-family staan: {emoji_svg}"
        );
    }

    #[test]
    fn build_text_elements_positions_the_emoji_after_the_preceding_text() {
        let lines = vec!["ab 😭".to_string()];
        let (_, emoji_svg) = build_text_elements(&lines, "Liberation Serif", 24, "#000000", 270.0);

        // x van de emoji moet voorbij TEXT_LEFT_X liggen (na "ab "), niet erop.
        assert!(emoji_svg.contains(r#"x="344.6""#), "emoji-x zou net na de tekst moeten starten: {emoji_svg}");
        assert!(emoji_svg.contains(r#"y="270""#), "emoji-y moet gelijk zijn aan de tekst-baseline van die regel: {emoji_svg}");
    }

    #[test]
    fn renders_a_sample_slide_to_disk() {
        let lines = vec![
            "Dit is een test-confessie.".to_string(),
            "Tweede regel van de tekst.".to_string(),
        ];

        let input = SlideRenderInput {
            lines: &lines,
            sequence_number: 4200,
            font_family: "Times New Roman",
            font_size: 30,
            text_color: "#1a1a1a",
            meme: None,
        };

        let png_bytes = render_slide_to_png(&input).expect("rendering zou moeten lukken");
        fs::write("test_output.png", png_bytes).expect("wegschrijven zou moeten lukken");
    }

    #[test]
    fn renders_a_full_confession_across_multiple_slides() {
        let confession_text = "Dit is een lang verhaal dat ik al een tijdje kwijt wil. \
Het begon allemaal op een gewone dinsdag, niets bijzonders aan de hand, tot ik iets \
zag dat mijn hele kijk op de zaak veranderde. Ik weet niet goed hoe ik dit moet \
vertellen zonder dat het gek klinkt, maar ik ga het toch proberen.\n\n\
Sindsdien denk ik er elke dag aan. Soms lig ik 's nachts wakker en vraag ik me af \
of ik de juiste keuze heb gemaakt, of dat ik alles anders had moeten aanpakken. \
Het is niet makkelijk om hierover te praten, zeker niet met mensen die dichtbij staan.\n\n\
Toch voelt het goed om het eindelijk ergens kwijt te kunnen, ook al is het anoniem. \
Misschien herkent iemand zich hierin. Wie weet.\n\n\
Hier is nog een extra stuk tekst om te showen dat er meerdere slides volgen! Bla bla blaaaa\
en meer en meer en meer bla bla bla. ".to_string();

        let font_size: u32 = 30;
        let slides_text = split_text_into_slides(&confession_text, max_chars_per_slide(font_size));
        println!("Aantal slides: {}", slides_text.len());

        for (slide_index, slide_text) in slides_text.iter().enumerate() {
            let lines = wrap_paragraph_into_lines(slide_text, max_chars_per_line(font_size));
            println!("Slide {}: {} regels", slide_index + 1, lines.len());

            let input = SlideRenderInput {
                lines: &lines,
                sequence_number: 4200,
                font_family: "Times New Roman",
                font_size,
                text_color: "#1a1a1a",
                meme: None,
            };

            let png_bytes = render_slide_to_png(&input).expect("rendering zou moeten lukken");
            let file_name = format!("test_output_slide_{}.png", slide_index + 1);
            fs::write(&file_name, png_bytes).expect("wegschrijven zou moeten lukken");
        }
    }

    #[test]
    fn renders_a_slide_with_a_meme_after_the_text() {
        let lines = vec!["Korte tekst met een meme erna.".to_string()];
        let one_pixel_png: Vec<u8> = vec![
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48,
            0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00,
            0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78,
            0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
        ];

        let input = SlideRenderInput {
            lines: &lines,
            sequence_number: 1,
            font_family: "Arial",
            font_size: 30,
            text_color: "#1a1a1a",
            meme: Some(MemeInput { bytes: &one_pixel_png, content_type: "image/png", position: MemePosition::After, scale: 1.0 }),
        };

        let png_bytes = render_slide_to_png(&input).expect("rendering met meme zou moeten lukken");
        fs::write("test_output_with_meme.png", png_bytes).expect("wegschrijven zou moeten lukken");
    }

    #[test]
    fn larger_scale_never_exceeds_the_max_width() {
        let layout = layout_meme_before(MEME_SCALE_MAX);
        let meme_box = layout.meme_box.expect("meme_box zou aanwezig moeten zijn");
        assert!(meme_box.width <= MEME_MAX_WIDTH_PX);
        assert!(meme_box.x >= 0.0, "moet gecentreerd blijven, niet buiten de kaart uitsteken");
    }

    #[test]
    fn smaller_scale_shrinks_the_meme_box() {
        let default_box = layout_meme_before(1.0).meme_box.expect("meme_box");
        let small_box = layout_meme_before(MEME_SCALE_MIN).meme_box.expect("meme_box");
        assert!(small_box.height < default_box.height);
        assert!(small_box.width < default_box.width);
    }
}
