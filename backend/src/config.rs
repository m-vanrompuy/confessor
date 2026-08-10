//! Instellingen/omgevingsvariabelen inladen (Sheet-ID, GCP project, ...).
//!
//! Lokaal komen deze uit een `.env`-bestand (zie `.env.example`), op Cloud Run
//! worden ze als echte omgevingsvariabelen meegegeven bij de deployment.

/// Cloud Run geeft de te gebruiken poort door via de PORT-omgevingsvariabele.
/// Lokaal bestaat die variabele meestal niet, dus dan vallen we terug op 8080.
pub fn server_port() -> u16 {
    std::env::var("PORT")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(8080)
}

/// Het Google Cloud project-ID waarin Firestore en Cloud Storage leven.
pub fn project_id() -> String {
    require_env("GOOGLE_CLOUD_PROJECT")
}

/// ID van de Google Sheet gekoppeld aan het inzendformulier.
pub fn sheet_id() -> String {
    require_env("SHEET_ID")
}

/// Naam van het tabblad met de formulierantwoorden.
/// Zelden veranderend, dus met een terugvalwaarde in plaats van verplicht.
pub fn sheet_tab_name() -> String {
    std::env::var("SHEET_TAB_NAME").unwrap_or_else(|_| "Formulierreacties 1".to_string())
}

/// Naam van de Cloud Storage-bucket waar gerenderde afbeeldingen naartoe gaan.
pub fn storage_bucket() -> String {
    require_env("STORAGE_BUCKET")
}

/// Leest een verplichte omgevingsvariabele in, of stopt meteen met een duidelijke
/// foutmelding — beter een vroege crash bij opstarten dan een vage fout later.
fn require_env(name: &str) -> String {
    std::env::var(name).unwrap_or_else(|_| panic!("omgevingsvariabele {name} ontbreekt"))
}
