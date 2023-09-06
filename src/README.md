
	TODO:

	MUST
	- Spreuken & Technieken gives a summary of the selected skills
	- RESET: button on TOP reset the Character Creator, clears all tables.
	

	SHOULD:
	- PREREQUISITES: check for prerequisistes to prevent invalid selection of skills 
	- SELECT: skills have tooltips
	- button TOP: export Character >> JSON format
	

	COULD:
	- integration with VOIDWALKER / create new characters
		> this requires integration on perhaps and API level
		> Needs to be done from within a player portal?


	DONE:
	
	20230901 	Character eigenschappen are added/subtracted on the selection of sklls
				if already present, than numeric values are adjusted accordinly. 
				JSON should contain the relevant properties under 'Eigenschappen':
				"Eigenschappen": {
					"hitpoints": 0,
					"armourpoints": 0,
					"elemental_mana": 0,
					"elemental_ritual_mana": 0,
					"spiritual_mana": 0,
					"spiritual_ritual_mana": 0,
					"inspiration": 0,
					"willpower": 0,
					"glyph_cap": 0,
					"glyph_imbue_cap": 0,
					"rune_cap": 0,
					"rune_imbue_cap": 0
				  }