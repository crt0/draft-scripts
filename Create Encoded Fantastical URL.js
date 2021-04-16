// Create Encoded Fantastical URL

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	let prompt = Prompt.create();
	prompt.title = 'Calendar';
	prompt.message = 'Destination calendar for the appointment';
	prompt.addTextField('calendar', 'Calendar', '');
	prompt.addButton('OK');

	const ok_clicked = prompt.show();
	if (!ok_clicked) {
		context.cancel();
		return;
	}

	let transform_message_parts = (text) => text.split(/«(.*?)»/).map((v, i) => i % 2 ? `«${v}|u»` : encodeURIComponent(v)).join('');

	let new_draft = Draft.create();
	new_draft.content = 'x-fantastical3://parse?sentence=' + transform_message_parts(draft.content) + '&calendarName=' + prompt.fieldValues.calendar + '&add=1';
	new_draft.update();

	editor.load(new_draft);
	editor.activate();
})();
