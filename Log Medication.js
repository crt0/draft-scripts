// Log Medication

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	let medication_draft = Draft.query('', 'all', ['_medication_log']);
	if (!medication_draft || !medication_draft[0]) {
		alert("Couldn't find an archived draft tagged '_medication_log'");
		context.fail();
		return false;
	}
	
	let prompt = Prompt.create();
	prompt.title = 'Log Medications';
	prompt.addSelect('medications', 'Medications', ['Acetaminophen', 'Amoxicillin', 'Florastor', 'Ibuprofen', 'Tramadol'], [], true);
	prompt.addButton('Log');
	
	if (!prompt.show()) {
		return false;
	}
	
	const date_options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
	const datestamp = (new Date()).toLocaleDateString('en-CA', date_options);
	for (let selected of prompt.fieldValues.medications) {
		medication_draft[0].append('- ' + datestamp + ': ' + selected);
	}
	medication_draft[0].update();
})();