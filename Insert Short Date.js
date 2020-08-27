// Insert Short Date
//
// (Of the format Tue, 8/18)

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	let date_options = { weekday: 'short', month: 'numeric', day: 'numeric' };
	editor.setSelectedText((new Date()).toLocaleDateString("en-us", date_options));
})();