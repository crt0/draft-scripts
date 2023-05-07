(() => {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    let drafts = Draft.query('title:"Block Scheduling Daily Events"', 'archive',
                             ['_block_scheduling']);
    if (!drafts || !drafts[0]) {
        alert("Can't find Block Scheduling Daily Events draft");
        context.fail();
        return;
    }
    const daily_draft = drafts[0];
    drafts = Draft.query('title:"Block Scheduling Events"', 'archive',
                         ['_block_scheduling']);
    if (!drafts || !drafts[0]) {
        alert("Can't find Block Scheduling Events draft");
        context.fail();
        return;
    }
    const one_time_draft = drafts[0];

    function expand_daily_blocks(draft, day) {
        daily_draft.setTemplateTag('weekday', day);
        const body = daily_draft.content.replace(/[^\n]+/, '');
        const output = daily_draft.processTemplate(body);
        draft.content += '\n' + output;
    }

    let new_draft = new Draft();
    DAYS.forEach(day => expand_daily_blocks(new_draft, day));

    new_draft.content += '\n' + one_time_draft.content;
    new_draft.update();
})();
