	
	SPELLS & TECHNIQUES
	Spells and Techniques can be converted by running the pdf-reader_spreuken.js
	
	- Download the Spreuken PDF to the downloads folder
	- Run the pdf-reader_spreuken.js

	RECIPIES
	Recipies are created by reading the PDF files with Tabula
	URL: https://tabula.technology/

	- Start Tabula
	- Select the PDF
	- Create a selection over the tables
	- Export as JSON (data)
	- Place in Download folder
	- Run tabula-reader_recepten.js


	TODO:

	MUST
	- SPELLS/RECIPIES can be converted to JSON per script

	SHOULD:
	- PREREQUISITES: check for prerequisistes to prevent invalid selection of skills 
	- button TOP: export Character >> JSON format

	COULD:
	- integration with VOIDWALKER / create new characters
		> this requires integration on perhaps and API level
		> Needs to be done from within a player portal?


	DONE:
	
	20230908	Spells/recipies have tooltips
	
	20230905	Recipty gives a summary of the selected spells aquired by skills
	20230905	Spreuken & Technieken gives a summary of the selected spells aquired by skills
	20230605	RESET: button on TOP reset the Character Creator, clears all tables.
	
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