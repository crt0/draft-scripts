// New Draft from Templates
//
// Select from a list of drafts tagged 'template' and create new
// draft based on selection

(() => { // anonymous function prevents variable conflicts with other Drafts actions

	function add_tag_except_template(tag) {
		if (tag !== 'template')
			this.addTag(tag);
	}

	function sort_drafts_by_title(a, b) {
		return ('' + a.displayTitle).localeCompare(b.displayTitle);
	}

	// create temp workspace to query drafts
	let workspace = Workspace.create();
	workspace.tagFilter = 'template';
	// get list of drafts in workspace
	let drafts = new Map(workspace.query('all').sort(sort_drafts_by_title).map(d => [d.displayTitle, d]));

	// check if we found any valid templates
	if (drafts.size == 0) {
		alert("No templates found. To make templates available to this action, create a draft with the template content and assign it the tag 'template'.");
		return false;
	}

	// prompt to select
	let p = Prompt.create();
	p.title = 'New Draft with Template';
	p.message = "Select templates. A new draft will be created based the templates selected.";

	p.addSelect('templates', 'Templates', Array.from(drafts.keys()), [], true);
	p.addButton('OK');

	if (!p.show()) {
		context.cancel();
		return false;
	}

	let d = Draft.create();

	// get the selected template draft
	let template = '';
	let first_template = true;
	for (let selected of p.fieldValues.templates) {
		let template_draft = drafts.get(selected);
		template += template_draft.content + '\n';
		
		if (first_template) {
			d.languageGrammar = template_draft.languageGrammar;
			template_draft.tags.forEach(add_tag_except_template, d);
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
