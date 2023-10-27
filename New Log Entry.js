// New Log Entry
//
// Select from a list of drafts tagged 'log' and create a new
// entry in that draft. If no draft is selected, create a new
// draft.

(() => { // anonymous function prevents variable conflicts with other Drafts actions

	// create temp workspace to query drafts
	let workspace = Workspace.create();
	workspace.tagFilter = 'log';
	workspace.setAllSort('name', false, true);
	// get list of drafts in workspace
	const log_drafts = workspace.query('all');

	// prompt to select
	let prompt = Prompt.create();
	prompt.title = 'New Log';
	prompt.message = "Select draft. A new entry will be created in that draft. If no draft is selected, a new draft will be created.";

	let ix = 0;
	let identifiers = [];
	for (let d of log_drafts) {
		identifiers[ix] = ix + '. ' + d.displayTitle;
		ix++;
	}
	prompt.addSelect('logs', 'Logs', identifiers, []);
	prompt.addTextField('new_log', 'New Log Title', '');
	prompt.addButton('OK');

	const ok_clicked = prompt.show();
	if (!ok_clicked) {
		context.cancel();
		return;
	}

	// build a heading with a date stamp
	let heading = draft.processTemplate('## [[date|%A, %B %e, %Y]]\n');

	// create a new draft or use the selected one
	let destination_draft;
	if (prompt.fieldValues.new_log) {
		destination_draft = Draft.create();
		destination_draft.content = '# ' + prompt.fieldValues.new_log.trim() + '\n\n' + heading;
		destination_draft.addTag('log');
	}
	else {
		const selected_logs = prompt.fieldValues.logs;
		if (selected_logs.length < 1) {
			context.fail("Must choose a draft or specify a name for a new one");
			return;
		}
		const draft_number = selected_logs[0].split('. ')[0];
		if (!draft_number) {
			context.fail("Can't parse selection");
			return;
		}
		
		destination_draft = log_drafts[draft_number];
		const current_body = destination_draft.content.substring(destination_draft.title.length + 1, destination_draft.content.length);
		destination_draft.content = destination_draft.title + '\n\n' + heading + draft.content + '\n' + current_body;
	}

	destination_draft.update();
	editor.load(destination_draft);

	return true;
})();
