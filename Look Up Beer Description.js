(() => { // anonymous function prevents variable conflicts with other Drafts actions
	const BEER_LIST_UUID = '156AB826-9AAC-42F5-AAC9-9E960A7E5463';

	let beer_list = Draft.find(BEER_LIST_UUID);
	if (!beer_list) {
		context.fail("Beer list draft not found. Make sure you customize this action's BEER_LIST_UUID variable");
		return;
	}
	const styles = new Map(beer_list.content.split('\n').map(line => line.split(': ', 2)));
	const styles_array = Array.from(styles.keys());

	let prompt = Prompt.create();
	prompt.addPicker('style', 'Style', [styles_array]);
	prompt.addButton('OK');
	if (!prompt.show()) {
		context.cancel();
		return;
	}

	const chosen_style = styles_array[prompt.fieldValues.style[0]];
	if (!app.htmlToClipboard(MultiMarkdown.create().render('**' + chosen_style + ':** ' + styles.get(chosen_style))))
		context.fail('Error rendering rich text from HTML');
})();