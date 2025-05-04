// Markdown Tasks to OmniFocus Deluxe
// - Based on Rosemary Orchard's script, but also:
//     - Hyperlinks back to draft
//     - Only captures tri-state ({ }) tasks so as not to get attendees
//     - Captures indented items below task as notes
//     - Marks tasks as partially completed ({-}) in draft

(() => {
    const base_url = 'omnifocus://x-callback-url/paste';
    const permalink = draft.permalink;

    let taskpaper = '';
    let state = 'body';
    let index = 0;
    let tick = 0;

    // parse Markdown links
    let links = [];
    function replace_link(_, p1, p2) {
        links.push(p2);
        return p1;
    }
    function parse_links(s) {
        links = [];
        s = s.replace(/\[([^[]+)\]\(([^)]*)\)/gm, replace_link);
        return [s, ...links].join('\n');
    }

    editor.incompleteTasks.filter(task =>
        task && task.state && task.state[0] === '{'
    ).forEach(task => {
        let callback = CallbackURL.create();
        callback.baseURL = base_url;
        callback.addParameter('content', '- '
                              + parse_links(task.label) + '\n'
                              + permalink);
        if (!callback.open()) {
            alert(callback.status);
            context.fail();
        }

        editor.advanceTask(task);
    });
})();
