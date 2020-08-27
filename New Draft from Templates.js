// New Draft from Templates
//
// Select from a list of drafts tagged "template" and create new
// draft based on selection

(() => { // anonymous function prevents variable conflicts with other Drafts actions

	// create temp workspace to query drafts
	let workspace = Workspace.create();
	workspace.tagFilter = "template";
	workspace.setAllSort("name", false, true);
	// get list of drafts in workspace
	let drafts = workspace.query("all");
	
	// check if we found any valid templates
	if (drafts.length == 0) {
		alert("No templates found. To make templates available to this action, create a draft with the template content and assign it the tag \"template\".");
		return false;
	}
	
	// prompt to select
	let p = Prompt.create();
	p.title = "New Draft with Template";
	p.message = "Select templates. A new draft will be created based the templates selected.";
	
	let ix = 0;
	let identifiers = [];
	for (let d of drafts) {
		identifiers[ix] = ix + ". " + d.title;
		ix++;
	}
	p.addSelect("templates", "Templates", identifiers, [], true);
	p.addButton("OK");

	if (!p.show()) {
		return false;
	}

	let d = Draft.create();
	
	// get the selected template draft
	let template = "";
	let first_template = true;
	for (let selected of p.fieldValues["templates"]) {
		let template_draft = drafts[selected.split(". ")[0]];
		template += template_draft.content + "\n";
		
		if (first_template) {
				d.languageGrammar = template_draft.languageGrammar;
				d.tags = template_draft.tags;
				d.removeTag("template");
				first_template = false;
		}
	}
	
	d.content = d.processTemplate(template);
	d.update();
	
	// load new draft
	editor.load(d);
	editor.activate();
	return true;
})();