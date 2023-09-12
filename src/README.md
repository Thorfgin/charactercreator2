	
	SPELLS & TECHNIQUES
	Spells and Techniques can be converted by running the pdf-reader_spreuken.js
	
	- Download the Spreuken PDF to the downloads folder
	- Run the pdf-reader_spreuken.js
	- Check the spells/technique tooltips for faults

	RECIPIES
	Recipies are created by reading the PDF files with Tabula
	URL: https://tabula.technology/

	- Start Tabula
	- Select the PDF
	- Create a selection over the tables
	- Export as JSON (data)
	- Place in Download folder
	- Run tabula-reader_recepten.js for each loresheet
	- Copy the results into recepten.json
	- Check the tooltips for faults

	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
	TODO:

	MUST


	SHOULD:
	- PREREQUISITES: check for prerequisistes to prevent invalid selection of skills 
	- PREREQUISITES: stop removing of a skill when other skills are dependant on it as requirement
	- PREREQUISITES: add button to remove all skills that have it as a prerequisite.
	- button TOP: export Character >> JSON format

	COULD:
	- integration with VOIDWALKER / create new characters
		> this requires integration on perhaps and API level
		> Needs to be done from within a player portal?

	WOULD: 
	- Sleur en Pleur in de skill tabel of andere manier van herschikken.


	DONE:
	20230912	SKILLS have Tooltips available
	
	20230911    SPELLS/RECIPIES can be converted to JSON per script
	
	20230908	SPELLS/RECIPIES have tooltips
	
	20230905	RECIPY gives a summary of the selected spells aquired by skills
	20230905	SPELLS & TECHNIQUE gives a summary of the selected spells aquired by skills
	20230605	RESET: button on TOP reset the Character Creator, clears all tables.
	
	20230901 	Character properties are added/subtracted on the selection of sklls
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