use crate::model::firestore::TemplateConfig;

pub fn validate_setting_value(value: &str) -> Result<(), String> {
    if value.trim().is_empty() {
        return Err("De waarde mag niet leeg zijn".to_string());
    }

    Ok(())
}

pub fn validate_template_config(config: &TemplateConfig) -> Result<(), String> {
    if config.font_size == 0 {
        return Err("font_size moet groter dan 0 zijn".to_string());
    }

    if config.max_chars_per_slide == 0 {
        return Err("max_chars_per_slide moet groter dan 0 zijn".to_string());
    }

    Ok(())
}