// Meet Again
// - Present a list of recent drafts tagged with "meeting"
// - Copy certain sections from that draft forward, possibly with modifications:
//     - ## Attendees (clearing checkboxes)
//     - ## Background
//     - ## Reminders
//     - ## Milestones (moving "- New:" to bottom)
//     - ## Projects
// - Preserve all tags on the copied draft
// - If no recent draft is selected, create an empty draft of the same format

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	const days90_in_ms = 180 * 24 * 3600 * 1000;
	const begin_date = new Date((Date().now - days90_in_ms));
		
	function filter_unique_recent_drafts(draft, index, self) {
		if (draft.createdAt < begin_date) {
			return false;
		}
		return self.map(d => d.displayTitle).indexOf(draft.displayTitle) === index;
	}
	
	function sort_drafts_by_title(a, b) {
		return ('' + a.displayTitle).localeCompare(b.displayTitle);
	}
	
	function filter_draft_by_title(draft, index, self) {
		return draft.displayTitle == this;
	}
	
	function bring_section_forward(previous_content, section, callback) {
		let matches = previous_content.match(new RegExp("^## " + section + ".*?(?=^## )", "ms"));
		return matches ? callback(matches[0]) : "";
	}
	
	let meeting_drafts = Draft.query("", "all", ["meeting"], [], "created", true).sort(sort_drafts_by_title).filter(filter_unique_recent_drafts);
	
	let prompt = Prompt.create();
	prompt.title = "New Meeting Notes Draft";
	prompt.message = "Optionally select a previous meeting as a template.";
	prompt.addSelect("meeting", "Meeting", meeting_drafts.map(draft => draft.displayTitle), [], false);
	prompt.addButton("OK");
	
	let ok_clicked = prompt.show();
	if (!ok_clicked) {
		context.cancel();
		return;
	}
	
	let new_content = "# \n\n";
	let new_tags;
	if (prompt.fieldValues["meeting"][0]) {
		let selected_draft = meeting_drafts.find(filter_draft_by_title, prompt.fieldValues["meeting"][0]);
		if (!selected_draft) {
			alert("Can't find draft");
			context.fail();
			return;
		}
		let most_recent_content = selected_draft.content;
		new_title = selected_draft.title;
		new_tags = selected_draft.tags;

		new_content = new_title + "\n\n";

		// extract attendees & uncheck boxes
		new_content += bring_section_forward(most_recent_content, "Attendees", string => string.replace(/^- \[x\] /gm, "- [ ] "));

		// extract other sections
		["Background", "Reminders", "Milestones", "Projects"].forEach(heading =>
			new_content += bring_section_forward(most_recent_content, heading, string => string)
		);
	}
		
	// if no previous draft was selected, start anew
	else {
		new_content += `## Attendees
- [ ] 

## Background
- 

## Reminders
- 

## Milestones
- 

`;
		new_tags = ["meeting"];
	}
	
	new_content += `## 
- 
`;
	
	// create the new draft
	let new_draft = Draft.create();
	new_tags.forEach(tag => new_draft.addTag(tag));
	new_draft.content = new_content;
	new_draft.update();
	
	// bring it up in Drafts
	editor.load(new_draft);
	editor.activate();
})();