//! Instellingen/omgevingsvariabelen inladen (pad naar secrets, Sheet-ID, ...).

/// Cloud Run geeft de te gebruiken poort door via de PORT-omgevingsvariabele.
/// Lokaal bestaat die variabele meestal niet, dus dan vallen we terug op 8080.
pub fn server_port() -> u16 {
    std::env::var("PORT")
        .ok()
        .and_then(|value| value.parse().ok())
        .unwrap_or(8080)
}
