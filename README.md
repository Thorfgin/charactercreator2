[![CI/CD Master](https://github.com/Thorfgin/charactercreator/actions/workflows/node.js.yml/badge.svg)](https://github.com/Thorfgin/charactercreator/actions/workflows/node.js.yml)
![License](https://img.shields.io/github/license/Thorfgin/charactercreator)

	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	TODO:

	MUST

	SHOULD:
	- FAQ: add a set of FAQ to save time

	COULD:
	- PREREQUISITES: add button to remove all skills that have it as a prerequisite.
	- integration with VOIDWALKER / create new characters
		> this requires integration on perhaps and API level
		> Needs to be done from within a player portal?

	WOULD: 
	- PRESETS: Ability to click some preset-character builds somewhere
	- EXPORT CHARACTER: Export the character overview as a PDF, for easy use at the event.
	
	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	DONE
	20231005	FRAMEWORK: Major overhaul to deal with security risks
				UNITTESTING: Have been temporarily disabled untill deployments work properly
			BUGREPORT: removed the option, in favor of SENTRY implementation
			FAQ: added a FAQ page to answer some common questions

	20231004	RULESET_VERSION: futureproofing - added support to check on the ruleset version.
			generic fixes: seperated some components and functions for maintainability
			EXPORT BUILD: Export the current skillset into a downloadable file
			IMPORT BUILD: Import a local file and set it as the current skillset
			LOCALSTORAGE: Store a character under its own name. Make it reloadable by a pick-list
			LOCALSTORAGE: obfuscated the data, to somewhat prevent tinkering
			BUGREPORT: added option to report bugs

	20231004	RULESET_VERSION: futureproofing - added support to check on the ruleset version.
			generic fixes: seperated some components and functions for maintainability
			EXPORT BUILD: Export the current skillset into a downloadable file
			IMPORT BUILD: Import a local file and set it as the current skillset
			LOCALSTORAGE: Store a character under its own name. Make it reloadable by a pick-list
			LOCALSTORAGE: obfuscated the data, to somewhat prevent tinkering
			BUGREPORT: added option to report bugs

	20231001	LOCALSTORAGE: the latest build data is stored the localstorage

	20230928	bugfixes: fixed some minor inconsistencies
			- added special prereq to teacher expertise in tooltip
			- fixed check on extra skills for ritualism
	
	20230927		LORESHEET: column contains an actual link to the loresheet itself
			TABLE: columns are sortable by clicking the header
			TABLE: Drag and Drop in the skill table, as method of rearranging items

	20230926		SELECT: INFO next to the Select should INDICATE based on meeting pre-reqs
				(SIZE, COLOR, ANIMATION, ETC)
			WONT DO: Change Error messages (modals) to a (!) img with mouseover.
			This is done already above, as the only messages/modals are shown when adding/removing items.
			Removing has no valid option to show another (!).
			XP: add a reverse counter to show the ammount of free xp.


	20230924	SPELL: Add a PDF Source/Page reference to each GridItem
			SKILL: Add a PDF Source/Page reference to each row
			feature: Added and exception clause so certain skills are alllowed to bypass prerequisites
			bugfixes: fixed some inconsistencies in the skills, causing minor bugs

	20230922	REFACTOR: Major overhaul and seperation of functionality into functions for maintainability
			UNITTESTING: Added __test__ folder and implemented unittesting on prerequisites
			SELECT: Upgraded Select to add on an Enter, and blank on Escape
			bugfixes: several minor bugs in the prerequisites were fixed.

	20230920	Major upgrade, all extra skills have been added.
			Several prerequisite checks have been updated.
			PREQUISITES: added option to select a category and XP value

	20230918		SELECT: customized the Selects to show a tooltip with the Skill description


	20230917	SKILL: ExtraSkill selection
			SKILL: ExtraSkill removal
			PREREQUISITES: Extend check on pre-requisites with ExtraSkill
			XP: Set a custom MAX_XP

	20230914	GRID CHAR PROPERTIES Each block should have an image	
			SELECT: Added XP cost to each skill label
			Created CI/CD to build and deploy to GitHub Pages:
			https://thorfgin.github.io/charactercreator/

	20230913	PREREQUISITES: check for prerequisistes to prevent invalid selection of skills 
			PREREQUISITES: stop removing of a skill when other skills are dependant on it as requirement
			SKILLS: Tooltip is properly formatted and shows the right content.
	
	20230912		SKILLS have Tooltips available
	

	20230911	SPELLS/RECIPIES can be converted to JSON per script
	
	20230908		SPELLS/RECIPIES have tooltips
	

	20230905	RECIPY gives a summary of the selected spells aquired by skills
			SPELLS & TECHNIQUE gives a summary of the selected spells aquired by skills
			RESET: button on TOP reset the Character Creator, clears all tables.
	
	20230901	Character properties are added/subtracted on the selection of sklls
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
