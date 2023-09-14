
	[![node.js](https://github.com/Thorfgin/charactercreator/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/Thorfgin/charactercreator/actions/workflows/node.js.yml)
	![License](https://img.shields.io/github/license/Thorfgin/charactercreator)

	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	TODO:

	MUST

	SHOULD:
	- Change Error messages (modals) to a (!) img with mouseover 
	- PREREQUISITES: add button to remove all skills that have it as a prerequisite.

	COULD:
	- integration with VOIDWALKER / create new characters
		> this requires integration on perhaps and API level
		> Needs to be done from within a player portal?

	WOULD: 
	- Drag and Drop in the skill table, or other method of rearranging item
	- EXPORT BUILD: Export the current skillset into a downloadable file
	- IMPORT BUILD: Import a local file and set it as the current skillset
	- PRESETS: Ability to click some preset-character builds somewhere
	- EXPORT CHARACTER: Export the character overview as a PDF, for easy use at the event.
	- LORESHEET: column contains an actual link to the loresheet itself

	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	DONE:
	
	20230914	Created CI/CD to build and deploy to GitHub Pages:
				https://thorfgin.github.io/charactercreator/

	20230913	PREREQUISITES: check for prerequisistes to prevent invalid selection of skills 
				PREREQUISITES: stop removing of a skill when other skills are dependant on it as requirement
				SKILLS: Tooltip is properly formatted and shows the right content.
	
	20230912	SKILLS have Tooltips available
	
	20230911    SPELLS/RECIPIES can be converted to JSON per script
	
	20230908	SPELLS/RECIPIES have tooltips
	
	20230905	RECIPY gives a summary of the selected spells aquired by skills
				SPELLS & TECHNIQUE gives a summary of the selected spells aquired by skills
				RESET: button on TOP reset the Character Creator, clears all tables.
	
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
