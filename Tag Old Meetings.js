// Tag Old Meetings
//
// Find old meeting notes drafts based on supplied title substrings
// and make sure a specific tag is applied as well as a "meeting"
// tag. Substrings and tags are supplied via a special archived draft
// tagged with "_tag_old_meetings" in the format:
//
// {
//     substring1: "tag1",
//     substring2: "tag2",
//     substring3: "tag3"
// }

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	let people_drafts = Draft.query("", "archive", ["_tag_old_meetings"]);
	if (!people_drafts || !people_drafts[0]) {
		alert("Couldn't find an archived draft tagged '_tag_old_meetings'");
		context.fail();
		return;
	}
	alert(people_drafts[0].content);
	let people = JSON.parse(people_drafts[0].content);
	if (!people) {
		alert("Couldn't parse '_tag_old_meetings' draft");
		context.fail();
		return;
	}
	
	let old_meeting_drafts = Draft.query("", "archive").filter(d => d.title.match("^# Meeting: ") || d.title.match("^# 1:1: "));
	
	let prompt = Prompt.create();
	prompt.title = "Update these drafts to new meeting notes format?";
	prompt.message = old_meeting_drafts.map(d => d.displayTitle).join("\n");
	prompt.addButton("Update");
	
	if (prompt.show()) {
		for (draft of old_meeting_drafts) {
			let new_content;
			let match = draft.content.match(/^# Meeting: /);
			if (match) {
				new_content = draft.content.replace(/^# Meeting: /, "# ");
			}
			
			match = draft.content.match(/^# 1:1: ([^ ]*)/)
			if (match) {
				new_content = draft.content.replace(/^# 1:1: /, "# ");
				if (!draft.hasTag(people[match[0]])) {
					draft.addTag(people[match[0]]);
				}
			}
			
			if (!draft.hasTag("meeting")) {
				draft.addTag("meeting");
			}
			
			draft.content = new_content;
			draft.update();
		}
	} else {
		context.cancel();
	}
})();