(() => {
	let recipients_draft = Draft.find('9193ED99-2B36-417B-B3F0-391BF1668599');
	if (!recipients_draft) {
		context.fail("Can't find draft of frequent text message recipients");
		return false;
	}
	const recipients = new Map(recipients_draft.content.split(/\n+/).filter(line => line.match(/^[^:]+:\s*[\d+-]+/)).map(line => line.split(/:\s*/, 2)));

	let p = Prompt.create();
	p.addSelect('recipients', 'Recipients', Array.from(recipients.keys()), [], true);
	p.addButton('OK');
	if (!p.show()) {
		context.cancel();
		return false;
	}

	const selected = p.fieldValues.recipients;
	if (selected)
		draft.setTemplateTag('recipients', selected.map(k => recipients.get(k)).join(', '));
})();
