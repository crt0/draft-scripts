(() => {
	const text = editor.getSelectedText();
	const [st, len] = editor.getSelectedRange();

	const new_text = text.replace(/\s*$/gm, '').replace(/^\W*/gm, '');

	editor.setSelectedText(new_text);
	editor.setSelectedRange(st, new_text.length);
})();
