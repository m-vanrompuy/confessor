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

/// Breedte/hoogte van de zone waarbinnen tekst moet passen (uitgetest, niet enkel
/// geometrisch gemeten — houdt al rekening met de marge die in de praktijk goed oogt).
const TEXT_AREA_WIDTH_PX: f64 = 740.0;
const TEXT_AREA_HEIGHT_PX: f64 = 710.0;

/// Vuistregel: gemiddelde tekenbreedte ≈ dit percentage van de font-size (sans-serif Latin).
const AVERAGE_CHAR_WIDTH_RATIO: f64 = 0.55;

/// Regelhoogte t.o.v. de font-size (moet overeenkomen met dy="1.4em" in build_tspans).
const LINE_HEIGHT_RATIO: f64 = 1.4;

/// Het nummer wordt groter weergegeven dan de body-tekst, vaste verhouding.
const NUMBER_FONT_SIZE_RATIO: f64 = 1.6;

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

/// Alle waardes die voor één slide in de SVG-template ingevuld moeten worden.
pub struct SlideRenderInput<'a> {
    pub lines: &'a [String],
    pub sequence_number: u32,
    pub font_family: &'a str,
    pub font_size: u32,
    pub text_color: &'a str,
}

/// Vult de SVG-template in met de gegeven tekst en rendert ze naar PNG-bytes.
pub fn render_slide_to_png(input: &SlideRenderInput) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let template = fs::read_to_string(TEMPLATE_PATH)?;
    let filled_svg = fill_template(&template, input);
    rasterize_svg(&filled_svg)
}

fn fill_template(template: &str, input: &SlideRenderInput) -> String {
    let lines_svg = build_tspans(input.lines);
    let number_font_size = (input.font_size as f64 * NUMBER_FONT_SIZE_RATIO).round() as u32;

    template
        .replace("{{LINES}}", &lines_svg)
        .replace("{{NUMBER}}", &input.sequence_number.to_string())
        .replace("{{NUMBER_FONT_SIZE}}", &number_font_size.to_string())
        .replace("{{FONT_FAMILY}}", &escape_xml(input.font_family))
        .replace("{{FONT_SIZE}}", &input.font_size.to_string())
        .replace("{{TEXT_COLOR}}", &escape_xml(input.text_color))
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
            };

            let png_bytes = render_slide_to_png(&input).expect("rendering zou moeten lukken");
            let file_name = format!("test_output_slide_{}.png", slide_index + 1);
            fs::write(&file_name, png_bytes).expect("wegschrijven zou moeten lukken");
        }
    }
}