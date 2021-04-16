// New Brewday Notes
//
// Select from a list of drafts tagged 'brewday' and create a new
// entry in that draft. If no draft is selected, create a new
// draft.

(() => { // anonymous function prevents variable conflicts with other Drafts actions

	async function update_draft(draft) {
		draft.update();
	}
	
	async function reload_draft(draft) {
		await update_draft();
		editor.load(draft);
		editor.activate();
	}
	
	// create temp workspace to query drafts
	let workspace = Workspace.create();
	workspace.tagFilter = 'brewday';
	workspace.setAllSort('name', false, true);
	// get list of drafts in workspace
	const brewday_drafts = workspace.query('all');

	// prompt to select
	let prompt = Prompt.create();
	prompt.title = 'New Brewday Entry';
	prompt.message = "Select draft. A new entry will be created in that draft. If no draft is selected, a new draft will be created.";

	let ix = 0;
	let identifiers = [];
	for (let d of brewday_drafts) {
		identifiers[ix] = ix + '. ' + d.displayTitle;
		ix++;
	}
	prompt.addSelect('beers', 'Beers', identifiers, []);
	prompt.addTextField('new_beer', 'New Beer', '');
	prompt.addDatePicker('brewdate', 'Brew Date', new Date(), {'mode': 'date'})
	prompt.addButton('OK');

	const ok_clicked = prompt.show();
	if (!ok_clicked) {
		context.cancel();
		return;
	}

	// build a template for what we want to insert
	const date_options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
	const date_stamp = prompt.fieldValues.brewdate.toLocaleDateString('en-us', date_options);
	const template = '## ' + date_stamp + `

### Recipe

### Brew Day

### Tasting Notes

`;

	// create a new draft or use the selected one
	let beer_draft;
	if (prompt.fieldValues.new_beer) {
		beer_draft = Draft.create();
		beer_draft.content = '# ' + prompt.fieldValues.new_beer.trim() + '\n\n' + template;
		beer_draft.addTag('brewday');
		beer_draft.addTag('brewing');
		beer_draft.update();
	}
	else {
		const selected_beers = prompt.fieldValues['beers'];
		if (selected_beers.length < 1) {
			context.fail("Must choose a draft or specify a name for a new one");
			return;
		}
		draft = brewday_drafts[prompt.fieldValues["beers"][0].split(". ")[0]];
		draft.content = draft.title + "\n\n" + template + draft.bodyPreview(Infinity);
		draft.update();
	}

	editor.load(beer_draft);

	return true;
})();
