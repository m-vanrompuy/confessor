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
/// op het <text>-element; elke <tspan> krijgt deze waarde vanuit build_tspans.
const TEXT_LEFT_X: &str = "305";

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

/// Regelhoogte t.o.v. de font-size (moet overeenkomen met dy="1.4em" in build_tspans).
const LINE_HEIGHT_RATIO: f64 = 1.4;

/// Het nummer wordt groter weergegeven dan de body-tekst, vaste verhouding.
const NUMBER_FONT_SIZE_RATIO: f64 = 1.6;

/// Meme-vak: breder dan de tekstkolom (spant bijna de volledige kaart), vaste
/// maximumhoogte. Bij "na de tekst" krimpt de hoogte als er niet genoeg ruimte
/// overblijft; bij "voor de tekst" staat dit vak vast en schuift de tekst mee.
const MEME_LEFT_X: f64 = 80.0;
const MEME_WIDTH_PX: f64 = 920.0;
const MEME_MAX_HEIGHT_PX: f64 = 500.0;
const MEME_GAP_PX: f64 = 40.0;

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

fn compute_layout(num_lines: usize, font_size: u32, meme_position: Option<MemePosition>) -> Layout {
    match meme_position {
        None => Layout { text_y: TEXT_START_Y, meme_box: None },
        Some(MemePosition::Before) => layout_meme_before(),
        Some(MemePosition::After) => layout_meme_after(num_lines, font_size),
    }
}

/// Meme staat vast bovenaan de tekstzone, enkel de tekst schuift mee naar onder.
fn layout_meme_before() -> Layout {
    let text_y = TEXT_START_Y + MEME_MAX_HEIGHT_PX + MEME_GAP_PX;
    Layout {
        text_y,
        meme_box: Some(MemeBox { x: MEME_LEFT_X, y: TEXT_START_Y, width: MEME_WIDTH_PX, height: MEME_MAX_HEIGHT_PX }),
    }
}

/// Meme staat net onder de effectieve tekst (op basis van het echte aantal regels,
/// niet de volledige toegestane tekstzone) - krimpt als er weinig ruimte overblijft,
/// verdwijnt helemaal als er echt geen plaats meer is (lange tekst + meme samen).
fn layout_meme_after(num_lines: usize, font_size: u32) -> Layout {
    let line_height = font_size as f64 * LINE_HEIGHT_RATIO;
    let text_block_height = num_lines as f64 * line_height;
    let meme_y = TEXT_START_Y + text_block_height + MEME_GAP_PX;
    let available_height = (CARD_BOTTOM_Y - meme_y).min(MEME_MAX_HEIGHT_PX);

    let meme_box = if available_height > 0.0 {
        Some(MemeBox { x: MEME_LEFT_X, y: meme_y, width: MEME_WIDTH_PX, height: available_height })
    } else {
        None
    };

    Layout { text_y: TEXT_START_Y, meme_box }
}

fn fill_template(template: &str, input: &SlideRenderInput) -> String {
    let lines_svg = build_tspans(input.lines);
    let number_font_size = (input.font_size as f64 * NUMBER_FONT_SIZE_RATIO).round() as u32;
    let meme_position = input.meme.as_ref().map(|meme| meme.position);
    let layout = compute_layout(input.lines.len(), input.font_size, meme_position);

    let meme_element = match (&input.meme, &layout.meme_box) {
        (Some(meme), Some(meme_box)) => build_meme_element(meme, meme_box),
        _ => String::new(),
    };

    template
        .replace("{{LINES}}", &lines_svg)
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

fn build_tspans(lines: &[String]) -> String {
    let mut tspans = String::new();

    for (index, line) in lines.iter().enumerate() {
        let line_offset = if index == 0 { "0" } else { "1.4em" };
        let escaped_line = escape_xml(line);
        tspans.push_str(&format!(
            r#"<tspan x="{TEXT_LEFT_X}" dy="{line_offset}">{escaped_line}</tspan>"#
        ));
    }

    tspans
}

/// Escaped tekst voor gebruik binnen XML/SVG, zodat gebruikersinvoer (bv. "&" of "<")
/// de SVG-structuur niet kan breken.
fn escape_xml(text: &str) -> String {
    text.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn rasterize_svg(svg_content: &str) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
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
            meme: Some(MemeInput { bytes: &one_pixel_png, content_type: "image/png", position: MemePosition::After }),
        };

        let png_bytes = render_slide_to_png(&input).expect("rendering met meme zou moeten lukken");
        fs::write("test_output_with_meme.png", png_bytes).expect("wegschrijven zou moeten lukken");
    }
}
