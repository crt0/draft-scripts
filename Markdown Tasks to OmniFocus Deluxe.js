// Markdown Tasks to OmniFocus Deluxe
// - Based on Rosemary Orchard's script, but also:
//     - Hyperlinks back to draft
//     - Only captures tri-state ({ }) tasks so as not to get attendees
//     - Captures indented items below task as notes
//     - Marks tasks as partially completed ({-}) in draft

(() => {
    const base_url = 'omnifocus://x-callback-url/paste';
    let taskpaper = '';
    let state = 'body';
    let index = 0;
    let tick = 0;
    let permalink = draft.permalink;
    let match;
    draft.lines.forEach(function (line) {
        switch (state) {
        case 'body':
            match = line.match(/^(\s*)(- )\{ \} (.*)/);
            if (match) {
                state = 'task';
                indent = match[1].length;
                taskpaper = match[2] + match[3] + '\n';
                tick = index + indent + match[2].length + 1;
            }
            break;
        case 'task':
            match = line.match(/^(\s*)/);
            if (match[0].length > indent)
                taskpaper += line + '\n';
            else {
                let callback = CallbackURL.create();
                callback.baseURL = base_url;
                callback.addParameter('content', taskpaper.trim() + '\n'
                                      + ' '.repeat(indent) + permalink);
                if (callback.open())
                    if (tick) {
                        editor.setTextInRange(tick, 1, '-');
                    }
                else
                    console.log(callback.status);
                state = 'body';
                taskpaper = '';
                tick = 0;
            }
            break;
        }
        index += line.length + 1;
    });
})();