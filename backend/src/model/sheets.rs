//! Model-laag: haalt de ruwe confession-rijen op uit de Google Sheet.

use gcp_auth::{CustomServiceAccount, TokenProvider};
use std::path::PathBuf;

const SCOPE: &str = "https://www.googleapis.com/auth/spreadsheets.readonly";

const SHEET_ID: &str = "1W_Yuo-ql5lneUYsChpH_nfBFeeisKhJaPA0bEPuWero";
const TAB_NAME: &str = "Formulierreacties 1";

pub async fn fetch_raw_rows() -> Result<Vec<Vec<String>>, Box<dyn std::error::Error>> {
    let credentials_path = PathBuf::from("secrets/service-account.json");
    let service_account = CustomServiceAccount::from_file(credentials_path)?;
    let token = service_account.token(&[SCOPE]).await?;

    let encoded_tab = TAB_NAME.replace(' ', "%20");
    let range = format!("{encoded_tab}!A:Z");
    let url = format!("https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/{range}");

    let client = reqwest::Client::new();
    let response = client.get(&url).bearer_auth(token.as_str()).send().await?;

    let status = response.status();
    let body: serde_json::Value = response.json().await?;

    if !status.is_success() {
        return Err(format!("Sheets API gaf status {status}: {body}").into());
    }

    let rows: Vec<Vec<String>> = serde_json::from_value(body["values"].clone())?;

    Ok(rows)
}

#[derive(Debug)]
pub struct RawConfessionRow {
    pub timestamp: String,
    pub text: String,
    pub image_link: Option<String>,
    pub admin_message: Option<String>,
}

fn find_column(headers: &[String], name: &str) -> Option<usize> {
    headers.iter().position(|header| header == name)
}

fn get_cell(row: &[String], column_index: Option<usize>) -> String {
    match column_index {
        Some(index) => row.get(index).cloned().unwrap_or_default(),
        None => String::new(),
    }
}

pub fn parse_rows(rows: &[Vec<String>]) -> Vec<RawConfessionRow> {
    let headers = match rows.first() {
        Some(headers) => headers,
        None => return Vec::new(),
    };

    let timestamp_col = find_column(headers, "Tijdstempel");
    let text_col = find_column(
        headers,
        "Type your confession below (memes/images can be uploaded via the box below).",
    );
    let image_link_col = find_column(headers, "Afbeelding/meme (optioneel):");
    let admin_message_col = find_column(headers, "(Anoniem) bericht aan de admin:");

    let mut result = Vec::new();

    for row in rows.iter().skip(1) {
        let text = get_cell(row, text_col);
        if text.trim().is_empty() {
            continue;
        }

        let image_link_raw = get_cell(row, image_link_col);
        let image_link = if image_link_raw.trim().is_empty() {
            None
        } else {
            Some(image_link_raw)
        };

        let admin_message_raw = get_cell(row, admin_message_col);
        let admin_message = if admin_message_raw.trim().is_empty() {
            None
        } else {
            Some(admin_message_raw)
        };

        result.push(RawConfessionRow {
            timestamp: get_cell(row, timestamp_col),
            text,
            image_link,
            admin_message,
        });
    }

    result
}