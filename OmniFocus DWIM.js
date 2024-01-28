(() => {
    const MARKDOWN_ACTION = 'Markdown Tasks to OmniFocus Deluxe';
    const TASKPAPER_ACTION = 'Taskpaper to OF Inbox';

    const c = draft.content;
    let action;
    if (c.match(/^#/gm) || c.match(/^\s*[-+*] {[- x]}\s/gm))
        action = Action.find(MARKDOWN_ACTION);
    else
        action = Action.find(TASKPAPER_ACTION);
    app.queueAction(action, draft);
})();
