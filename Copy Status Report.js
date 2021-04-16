// Copy Status Report
//
// Copy the relevant contents of a status report to the clipboard for
// posting in the wiki

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	
	// remove empty sections
	let report = draft.content.replace(/^   \* \*[^*]+\*\n {6}1. *\n/gm, '');
	
	// copy everything but title
	let all_but_title = report.replace(/^[^\n]*\n/ms, '');
	app.setClipboard(all_but_title);
})();