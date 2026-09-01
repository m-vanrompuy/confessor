//! Business logic-laag: bepaalt het volgende vrije volgnummer voor een confession.

/// Geeft het volgende vrije volgnummer terug op basis van de reeds gebruikte nummers
/// én een instelbaar minimum (issue #116) - nodig omdat de admin al confessions
/// manueel genummerd heeft vóór deze tool bestond (in de praktijk 1800+), dus
/// zonder dat minimum zou de nummering hier gewoon terug bij 1 beginnen en botsen
/// met wat al gepubliceerd is. Zodra de echte nummering het minimum voorbijsteekt,
/// heeft dat geen effect meer tot de admin het opnieuw optrekt.
pub fn determine_next_sequence_number(existing_numbers: &[u32], minimum_next_number: u32) -> u32 {
    let highest_plus_one = existing_numbers.iter().max().map_or(1, |highest| highest + 1);
    highest_plus_one.max(minimum_next_number)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn starts_at_one_without_existing_numbers_or_minimum() {
        assert_eq!(determine_next_sequence_number(&[], 0), 1);
    }

    #[test]
    fn continues_after_the_highest_existing_number() {
        assert_eq!(determine_next_sequence_number(&[3, 1, 7, 5], 0), 8);
    }

    #[test]
    fn jumps_to_the_minimum_when_it_is_higher_than_existing_numbers() {
        assert_eq!(determine_next_sequence_number(&[3, 1, 2], 1801), 1801);
    }

    #[test]
    fn minimum_stops_mattering_once_real_numbering_catches_up() {
        assert_eq!(determine_next_sequence_number(&[1801, 1802], 1801), 1803);
    }
}
