// Copy as Rich Text & Pick Font
// - Request font & size
// - Convert Draft from Markdown to HTML using that font & size

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	let mmd = MultiMarkdown.create();
	const html = mmd.render(draft.content);

	// Wrap raw MMD output with HTML template with styles to set base fonts
	const families = ['Georgia', 'Gill Sans', 'Helvetica', 'HelveticaNeue', 'Palatino-Roman', 'Times'];
	const sizes = ['11', '12', '13', '14', '15', '16', '17'];
	let prompt = Prompt.create();
	let selected_family = 2;
	let selected_size = device.systemName == 'macOS' ? 3 : 6;
	prompt.addPicker('font', 'Font', [families, sizes], [selected_family, selected_size]);
	prompt.addButton('OK');
	const success = prompt.show();
	if (!success) {
		context.cancel();
		return false;
	}

	const family = families[prompt.fieldValues.font[0]];
	const size = sizes[prompt.fieldValues.font[1]];
	const document = `<html>
<body style='font-family: "${family}"; font-size: ${size}px'>
${html}
</body>
</html>
`;

	// Place in clipboard as rich text
	if (!app.htmlToClipboard(document)) {
		context.fail('Error rendering rich text from HTML');
		return false;
	}
})();