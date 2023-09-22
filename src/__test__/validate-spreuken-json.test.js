import sourceSpreuken from '../../src/json/spreuken.json';

// Test for Unique Spell id's
function hasUniqueSpellIDs(json) {
	const spells = [];
	for (const category of sourceSpreuken.Categories) {
		for (const skill of category.Skills) {
			for (const spell of skill.Spells) {
				spells.push(spell);
			}
		}
	}

    const duplicateIDs = new Set();
    const set = new Set();
    for (const id of spells) {
        if (set.has(id)) {
            duplicateIDs.add(id);
        } else {
            set.add(id);
        }
    }
    if (duplicateIDs.size > 0) { console.warn('Duplicate IDs:', duplicateIDs); }
    return duplicateIDs.size === 0;
}

// Test cases
test('Spreuken JSON should have unique IDs per Spell', () => { expect(hasUniqueSpellIDs(sourceSpreuken)).toBe(true); });