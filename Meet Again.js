// Meet Again
// - Present a list of recent drafts tagged with "meeting"
// - Copy that draft forward, clearing Attendees checkboxes
// - Preserve all tags on the copied draft
// - If no recent draft is selected, create an empty draft from a template

(() => { // anonymous function prevents variable conflicts with other actions
    function sort_drafts_by_title(a, b) {
        return ('' + a[0]).localeCompare(b[0]);
    }

    // create temp workspace to query drafts
    let workspace = Workspace.create();
    workspace.tagFilter = 'meeting';
    workspace.setAllSort('created');

    let start = new QueryDate();
    start.field = 'created';
    start.type = 'relative';
    start.days = -150;
    workspace.startDate = start;

    // get list of drafts in workspace
    let meeting_drafts = new Map(workspace.query('all')
                                          .filter(d => !d.isTrashed)
                                          .map(d => [d.displayTitle, d])
                                          .sort(sort_drafts_by_title));

    let prompt = Prompt.create();
    prompt.title = 'New Meeting Notes Draft';
    prompt.message = 'Optionally select a previous meeting as a template.';
    prompt.addSelect('meeting', 'Meeting', Array.from(meeting_drafts.keys()),
                     [], false);
    prompt.addButton('OK');

    let ok_clicked = prompt.show();
    if (!ok_clicked) {
        context.cancel();
        return;
    }

    let new_draft;
    let new_content;
    let new_tags;
    let cursor = 0;
    if (prompt.fieldValues.meeting[0]) {
        let selected_draft = meeting_drafts.get(prompt.fieldValues.meeting[0]);
        if (!selected_draft) {
            alert("Can't find draft");
            context.fail();
            return;
        }

        if (selected_draft.isArchived) {
            let latest_content = selected_draft.content;
            new_tags = selected_draft.tags;

            new_content =
              latest_content.replace(/^## Attendees\n(.*?)^#/gms,
                                     s => s.replace(/^- \[x\] /gm, '- [ ] '));
        }

        else {
            new_draft = selected_draft;
            app.displayInfoMessage('Found in Inbox');
        }
    }

    // if no previous draft was selected, start anew
    else {
        new_content = `#

## Attendees
- [ ] 

## Background
- 

## 
- 

`;
        cursor = new_content.length - 5;

        new_content += `## Milestones
- 

## Reminders
- 

## Roundtable
-

## Next Meeting
`;
        new_tags = ['meeting'];
    }

    if (!new_draft) {
        new_draft = Draft.create();
        new_tags.forEach(tag => new_draft.addTag(tag));
        new_draft.content = new_content;
        new_draft.update();
    }

    // bring it up in Drafts
    editor.load(new_draft);
    editor.setSelectedRange(cursor, 0);
    editor.activate();
})();
