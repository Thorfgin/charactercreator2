[![CI/CD Master](https://github.com/Thorfgin/charactercreator/actions/workflows/node.js.yml/badge.svg)](https://github.com/Thorfgin/charactercreator/actions/workflows/node.js.yml)
![License](https://img.shields.io/github/license/Thorfgin/charactercreator)

	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	TODO:
	
	CRITICALS:
	- 

	MUST:
	- LANGUAGE: add multi-language support as an option >> English

	
	SHOULD:
	- FEATURE: Extend the character with a NOTE section to allow players to register remarks, powers/conditions, etc.
	- FEATURE: Extend the character with a Imbue section to allow players to register imbues, description and cost, etc.
	- FEATURE: Add a button to forcefully add a skill and re-adjust the max XP.

	COULD:
	- PREREQUISITES: add all single-tree prerequisite skills that are listed as a prerequisite.
	- PREREQUISITES: add button to remove all skills that have it as a prerequisite.
	- FEATURE: add an option to set a random amount of XP and sets random skills
	- FEATURE: add option that adds XP based on nr of events player.

	WOULD: 
	- FEATURE: add option that random XP based on randomly selected skills.
	- integration with VOIDWALKER / create new characters
		> this requires integration on perhaps an API level
		> Needs to be done from within a player portal? Probably requires a Node.js server

	COULD NOT REPRODUCE: 
	- Chromium browser compatibility issues


	PLAYER REQUESTS:
	> UNDER REVIEW: Als ik een skill wil toevoegen die niet mag (bijvoorbeeld een c skill zonder de B) dan wordt mij niet verteld WAAROM het niet mag.
	> UNDER REVIEW: De standaard templates knop zou wel iets groter mogen, deze is nu bijna onzichtbaar  (2x)
	> UNDER REVIEW: Ik wil meerdere skills kunnen selecteren en in 1x toe toevoegen.
	> UNDER REVIEW: Ik wil leven in duisternis, DARK MODE!
	
	> APPROVED: Zou fijn zijn als je kan zeggen hoeveel evenementen je hebt mee gedaan en dat dan het aantal xp automatisch om hoog gaat.
	> APPROVED: RANDOM button toevoegen die RANDOM xp en bijbehorende vaardigheden selecteert.
	> APPROVED: wanneer skill je over de XP heen brengt kun je hem niet toevoegen. kan er een knop komen om dit te forceren?
	> APPROVED: imbues missen, zou fijn zijn als deze als apart blok toegevoegd kunnen worden.
	> APPROVED: Het zou fijn zijn, als je een vaardigheid pakt met hele duidelijke prereqs, zoals Harnas 3, dat hij je dan automatisch Harnas 1 en 2 geeft.
	
	> DECLINED: Powers & Conditions beschikbaar maken bij characters. 
		Niet beschikbaar, want geen koppeling met Voidwalker.
	> DECLINED: In de PDF mogen de character eigenschappen kleiner zodat de vaardigheden op hetzelfde blaadje passen
		Meh, wanneer er te veel skills zijn volgt een overflow de volgende pagina op. Per pagina printbaar > compressie.
	> DECLINED: Loresheet kolom is lang niet overal nodig, is het handig om de download PDF knop bij de acties te plaatsen?
		Meh, weten dat er *geen* loresheet voor is, is soms net zo belangrijk. Ik zie ze liever in de tabel direct erbij


	=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

	DONE
	20240501	FIX: change the way skills are selected, by referencing id instead of skill.
			Skills may no be unique in name, for example 'extra wilskracht' exists twice in ExtraVaardigheden.
			This may cause issues with the saves, because everything is reference by skillname.
			FIX: vaardigheden.json: change the way spells/recipies are selected, by referencing id instead of name.
			FIX spreuken.json: change the way spells are selected, by referencing spell id instead of spell name.
			FIX recepten.json: change the way recipes are selected, by referencing recipe id instead of recipe name.

	20240430	FIX: Typos in templates, sizing of the Info description of a Template.
			FIX: Updated FAQ > printing the character is possible by PDF export.

	20240420	CRITICAL FIX: Automatic CNAME listing for the GitHub Pages > or the site goes down
			CRITICAL FIX: Sentry finding, ensure Safari can handle the PDF.
				>> DEFECT: jsPDF PubSub Error Font is not stored as string-data in vFS, import fonts or remove declaration doc.addFont('InknutAntiqua-Regular.ttf'). 
			FIX: Add text '/per Day' to mana gained.
			FIX: Character Eigenschappen and Energy per Day is not not exporting propperly.
			FIX: Change minimum XP to 0, so editing MAX XP on mobile is allowed.
			FIX: Close a modal when the user clicks outside the msg.
			FIX: Change Recipe > Omschrijving, add text: 'Je kan nu Mythical Metal verwerken'.
			FIX: When skills are sorted and a new skill is added, it is not added in the sorted order.
			FIX: Filter skill 'Leermeester Expertise' from the Basisvaardigheden when IsChecked is set. 
			
	20240416	FIX: Kennis van Kruiden inspirition adjusted 3 to 2 inspiration.
				FIX: Max saved XP cap raised from 2 to 3.
			FIX: Size of the Recipy panel adjusted so "Minor potion of inspiration of the magi" fits.
			FIX: Changed the info panel for Spells to show Energy instead of Mana.

	20231106	PRESETS: add a generic text and description per preset explaing the general style of play 
				for this type of character on Vortex Adventure
			NEWCHAR: expand the XP warning with a explainatory text on skill shuffle for new players.	
			FIX: Again faulty scaling based of the image Character Eigenschappen based on current screen dimensions	
			UNITTEST: improved unittests for vaardigheden.json to cross-reference Spells, Recipes, Requirements
			UNITTEST: add unittests for presets.json 
			UNITTEST: add unittests for releasenotes.json

	20231101	VERSION: when clicking the version, show a modal with the release notes.
			MIN-XP: When a build has spend less than 13 points, show a warning next to XP remaining that XP will be lost.
			FRAMEWORK: Reworked the Tooltips to be less convoluted and more maintainable
			FIX: minor bug in Presets, causing a single preset not to load.
			FIX: faulty scaling based of the image Character Eigenschappen based on current screen dimensions
			FIX: Adding a Skill to the Select, than loading a preset (or save) does not clear Select.
			  This results in the skill being added twice.
			FIX: on loading a character the new Character check was nog set propperly after refactoring
			FIX: fixed a faulty spell name
			LOOKS/FEELS: Changed the NewCharacter toggle, it will no longer erase when unchecking the checkbox,
			unless and Extra skill was added. If that is the case it will be erased entirely still.


	20231028	FRAMEWORK: When a json is updated, old characters do not reload their skills 
			on a load (localstorage) or import (datafile). Instead, old data is loaded causing failures 
			in the code. This requires a conversion of the current way to save characters.
			CHARNAME: when refreshing or reloading the page, the name of the character is now restored

	20231026	FIX BUG: When adding a skill with the + while at MAX XP will still allow adding the skill somehow.
			PDF EXPORT: Export the character overview as a PDF, for easy use at the event.

	20231018	FRAMEWORK: Decoupled components and seperated dataobjects to a seperated context.

	20231012	PRESETS: Ability to load a preset-character
			ARTIFACT: the CI/CD yields an artifact for sharing convenience.
			Bugfix: fixed negative XP remaining

	20231011	UNITTESTING: Reinstated. Added coverage logging.
			FAQ: added a FAQ page to answer some common questions
			LOCALSTORAGE: Extended the save/load buttons with confirm messages
			Fixed some minor issues.

	20231005	FRAMEWORK: Major overhaul to deal with security risks
			UNITTESTING: Have been temporarily disabled untill deployments work properly
			BUGREPORT: removed the option, in favor of SENTRY implementation

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
	
	20230927	LORESHEET: column contains an actual link to the loresheet itself
			TABLE: columns are sortable by clicking the header
			TABLE: Drag and Drop in the skill table, as method of rearranging items

	20230926	SELECT: INFO next to the Select should INDICATE based on meeting pre-reqs
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

	20230918	SELECT: customized the Selects to show a tooltip with the Skill description


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
	
	20230912	SKILLS have Tooltips available
	

	20230911	SPELLS/RECIPES can be converted to JSON per script
	
	20230908	SPELLS/RECIPES have tooltips
	

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
