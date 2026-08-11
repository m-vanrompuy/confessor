//! Model-laag: uploadt gerenderde afbeeldingen naar Cloud Storage for Firebase.

use crate::config;

const SCOPE: &str = "https://www.googleapis.com/auth/devstorage.read_write";

/// Uploadt PNG-bytes naar de bucket onder `object_path`, en geeft dat pad terug
/// zodat de caller het kan opslaan als `storage_path` op een Slide-document.
/// Beslist zelf niets over de padstructuur - dat is aan de caller.
pub async fn upload_png(object_path: &str, png_bytes: Vec<u8>) -> Result<String, Box<dyn std::error::Error>> {
    let provider = gcp_auth::provider().await?;
    let token = provider.token(&[SCOPE]).await?;

    let bucket = config::storage_bucket();
    let url = format!("https://storage.googleapis.com/upload/storage/v1/b/{bucket}/o");

    let client = reqwest::Client::new();
    let response = client
        .post(&url)
        .query(&[("uploadType", "media"), ("name", object_path)])
        .bearer_auth(token.as_str())
        .header("Content-Type", "image/png")
        .body(png_bytes)
        .send()
        .await?;

    let status = response.status();
    if !status.is_success() {
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Cloud Storage upload gaf status {status}: {body}").into());
    }

    Ok(object_path.to_string())
}

/// Verwijdert een object uit de bucket. Een object dat al weg is (404) telt ook als
/// geslaagd - het gewenste eindresultaat ("bestaat niet meer") is toch bereikt.
pub async fn delete_object(object_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let provider = gcp_auth::provider().await?;
    let token = provider.token(&[SCOPE]).await?;

    let bucket = config::storage_bucket();
    let mut url = reqwest::Url::parse(&format!("https://storage.googleapis.com/storage/v1/b/{bucket}/o"))?;
    url.path_segments_mut()
        .map_err(|_| "kon storage-URL niet opbouwen")?
        .push(object_path);

    let client = reqwest::Client::new();
    let response = client.delete(url).bearer_auth(token.as_str()).send().await?;

    let status = response.status();
    if !status.is_success() && status != reqwest::StatusCode::NOT_FOUND {
        let body = response.text().await.unwrap_or_default();
        return Err(format!("Cloud Storage delete gaf status {status}: {body}").into());
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn uploads_a_tiny_test_png() {
        dotenvy::dotenv().ok();

        // 1x1 transparante pixel - genoeg om de upload-flow te verifiëren
        // zonder afhankelijk te zijn van image_render.rs.
        let one_pixel_png: Vec<u8> = vec![
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48,
            0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00,
            0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, 0x54, 0x78,
            0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
            0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
        ];

        let result = upload_png("test/issue-28-smoke-test.png", one_pixel_png).await;
        assert!(result.is_ok(), "upload zou moeten lukken: {:?}", result.err());
        assert_eq!(result.unwrap(), "test/issue-28-smoke-test.png");

        // Meteen weer opruimen, en meteen ook delete_object zelf verifiëren.
        let delete_result = delete_object("test/issue-28-smoke-test.png").await;
        assert!(delete_result.is_ok(), "delete zou moeten lukken: {:?}", delete_result.err());
    }

    #[tokio::test]
    async fn deleting_an_already_missing_object_is_not_an_error() {
        dotenvy::dotenv().ok();

        let result = delete_object("test/does-not-exist-issue-61.png").await;
        assert!(result.is_ok(), "404 zou als geslaagd behandeld moeten worden: {:?}", result.err());
    }
}
