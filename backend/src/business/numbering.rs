//! Business logic-laag: bepaalt het volgende vrije volgnummer voor een confession.

/// Geeft het volgende vrije volgnummer terug op basis van de reeds gebruikte nummers.
/// Begint bij 1 als er nog geen enkele confession gebruikt is.
pub fn determine_next_sequence_number(existing_numbers: &[u32]) -> u32 {
    match existing_numbers.iter().max() {
        Some(highest_number) => highest_number + 1,
        None => 1,
    }
}
