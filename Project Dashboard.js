// Project Dashboard

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	let date_options = { weekday: 'short', month: 'numeric', day: 'numeric' };

	let status_table = {};
	let meeting_drafts = Draft.query("", "all", ["meeting"], [], "created", true);
	for (draft of meeting_drafts) {
		let section = draft.content.match(new RegExp("^## Projects(.*?)(?=^## )", "ms"));
		if (!section) {
			continue;
		}
		for (line of section[0].split("\n")) {
			let match = line.match(/^- (?<project>[^:]*): (?<status>.*)/);
			if (match && !status_table.hasOwnProperty(match.groups.project)) {
				status_table[match.groups.project] = [draft.createdAt.toLocaleDateString("en-us", date_options), match.groups.status];
			}
		}
	}
	
	let new_draft = Draft.create();
	new_draft.content = "# Project Dashboard\n\n" + Object.keys(status_table).map(key => "- **" + key + ":** " + status_table[key][0] + "—" + status_table[key][1]).join("\n");
	new_draft.update();
	
	// bring it up in Drafts
	editor.load(new_draft);
	editor.activate();
})();