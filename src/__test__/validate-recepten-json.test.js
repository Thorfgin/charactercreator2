import sourceRecepten from '../../src/json/recepten.json';

// Test for Unique Recipy id's
function hasUniqueRecipyIDs(json) {
	const spells = [];
	for (const category of sourceRecepten.Categories) {
		for (const skill of category.Skills) {
			for (const spell of skill.Recipies) {
				spells.push(spell);
			}
		}
	}

	const set = new Set(spells);
	return set.size === spells.length;
}

// Test cases
test('Recepten JSON should have unique IDs per Recipy', () => { expect(hasUniqueRecipyIDs(sourceRecepten)).toBe(true); });