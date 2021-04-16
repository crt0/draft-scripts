// Create Encoded mailto URL

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	let prompt = Prompt.create();
	prompt.title = 'Recipient';
	prompt.message = 'Enter the recipient of this message.';
	prompt.addTextField('recipient', 'Recipient', '');
	prompt.addButton('OK');

	const ok_clicked = prompt.show();
	if (!ok_clicked) {
		context.cancel();
		return;
	}

	let transform_message_parts = (text) => text.split(/«(.*?)»/).map((v, i) => i % 2 ? `«${v}|u»` : encodeURIComponent(v)).join('');

	let new_draft = Draft.create();
	new_draft.content = 'mailto:' + prompt.fieldValues.recipient + '?subject=' + transform_message_parts(draft.title) + '&body=' + transform_message_parts(draft.processTemplate('[[body]]'));
	new_draft.update();

	editor.load(new_draft);
	editor.activate();
})();
