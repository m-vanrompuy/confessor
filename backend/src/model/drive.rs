//! Model-laag: haalt meme/afbeelding-bestanden op via de Google Drive API.
//! Vereist dat de map waarin het formulier bestanden opslaat gedeeld is met het
//! service-account (Viewer-rol) - zelfde principe als de Sheet-toegang.

const SCOPE: &str = "https://www.googleapis.com/auth/drive.readonly";

pub struct DriveFile {
    pub bytes: Vec<u8>,
    pub content_type: String,
}

/// Haalt de ruwe bytes + content-type van een Drive-bestand op.
pub async fn download_file(file_id: &str) -> Result<DriveFile, Box<dyn std::error::Error>> {
    let provider = gcp_auth::provider().await?;
    let token = provider.token(&[SCOPE]).await?;

    let url = format!("https://www.googleapis.com/drive/v3/files/{file_id}?alt=media");

    let client = reqwest::Client::new();
    let response = client.get(&url).bearer_auth(token.as_str()).send().await?;

    let status = response.status();
    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Drive API gaf status {status}: {body}").into());
    }

    let content_type = response
        .headers()
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("application/octet-stream")
        .to_string();

    let bytes = response.bytes().await?.to_vec();

    Ok(DriveFile { bytes, content_type })
}

/// Haalt alle bestands-ID's uit een `image_link`-veld. Meestal is dat één link zoals
/// "https://drive.google.com/open?id=XXXX", maar Google Forms staat toe dat een
/// formulier-vraag meerdere bestanden per antwoord toelaat - dan komen er meerdere,
/// komma-gescheiden links in hetzelfde veld terecht (in de praktijk zo'n 7,5% van de
/// confessions met een bijlage, soms wel 5 bestanden in één antwoord).
pub fn extract_file_ids(image_link_field: &str) -> Vec<String> {
    image_link_field
        .split(',')
        .filter_map(|link| extract_file_id(link.trim()))
        .collect()
}

fn extract_file_id(drive_link: &str) -> Option<String> {
    let url = reqwest::Url::parse(drive_link).ok()?;
    url.query_pairs()
        .find(|(key, _)| key == "id")
        .map(|(_, value)| value.to_string())
}

/// Kiest een bestandsextensie op basis van de content-type, voor een leesbaar
/// storage-pad. Onbekende types vallen terug op een generieke extensie.
pub fn extension_for_content_type(content_type: &str) -> &'static str {
    match content_type {
        "image/jpeg" => "jpg",
        "image/png" => "png",
        "image/gif" => "gif",
        "image/webp" => "webp",
        _ => "bin",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_a_single_id_from_a_form_upload_link() {
        let field = "https://drive.google.com/open?id=1vQTF5jdBRUuzk9WXPTDQ0x_UjBAC_963";
        assert_eq!(extract_file_ids(field), vec!["1vQTF5jdBRUuzk9WXPTDQ0x_UjBAC_963".to_string()]);
    }

    #[test]
    fn extracts_multiple_ids_from_a_comma_separated_field() {
        let field = "https://drive.google.com/open?id=AAA, https://drive.google.com/open?id=BBB";
        assert_eq!(extract_file_ids(field), vec!["AAA".to_string(), "BBB".to_string()]);
    }

    #[test]
    fn returns_empty_for_a_field_without_any_id() {
        let field = "https://drive.google.com/drive/folders/some-folder";
        assert_eq!(extract_file_ids(field), Vec::<String>::new());
    }

    #[test]
    fn maps_known_image_types_to_their_extension() {
        assert_eq!(extension_for_content_type("image/jpeg"), "jpg");
        assert_eq!(extension_for_content_type("image/png"), "png");
    }

    #[test]
    fn falls_back_to_generic_extension_for_unknown_types() {
        assert_eq!(extension_for_content_type("application/pdf"), "bin");
    }

    /// Handmatig te draaien check tegen echte, bestaande uploads - bevestigt dat het
    /// service-account effectief leestoegang heeft tot de Drive-map.
    #[tokio::test]
    #[ignore]
    async fn can_download_a_real_confession_attachment() {
        dotenvy::dotenv().ok();

        let result = download_file("1vQTF5jdBRUuzk9WXPTDQ0x_UjBAC_963").await;
        assert!(result.is_ok(), "download zou moeten lukken: {:?}", result.err());

        let file = result.unwrap();
        println!("content-type: {}, {} bytes", file.content_type, file.bytes.len());
    }
}
