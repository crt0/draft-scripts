(() => {
    const MARKDOWN_ACTION = 'Markdown Tasks to OmniFocus Deluxe';
    const TASKPAPER_ACTION = 'Taskpaper to OF Inbox';

    const c = draft.content;
    let action_name;
    if (c.match(/^#/gm) || c.match(/^\s*[-+*] {[- x]}\s/gm)) {
        action_name = MARKDOWN_ACTION;
        draft.isArchived = true;
    } else {
        action_name = TASKPAPER_ACTION;
        draft.isTrashed = true;
    }

    require(action_name + '.js');

    draft.update();
})();
