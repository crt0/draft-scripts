(() => {
    const baseURL = 'omnifocus:///paste';

    //set where the taskpaper should be saved
    const target = 'inbox';

    //replace any placeholder if they exist
    let known_placeholders = {};
    let placeholders = [];

    let content = editor.getText();
    let matches = content.match(/«(.+?)»/g);

    for (match in matches) {
        let placeholder = matches[match];
        known_placeholders[placeholder] = null;
        placeholders.push(placeholder);
    }

    if (placeholders.length === 0) {
        let alert = Prompt.create();
        alert.title = 'No template placeholders were found.';
        alert.body = "If your project text has placeholders (that look like «this»), this script will prompt for values you'd like to substitute for them.";
        let alertCancelled = alert.addButton('Continue Anyway');
        if (alertCancelled === false) {
            cancel('User cancelled the script');
        }
    } else {
        for (let placeholder in known_placeholders) {
            let showPlaceholder = placeholder.replace('«', '');
            showPlaceholder = showPlaceholder.replace('»', '');
            let query = Prompt.create();
            query.title = placeholder;
            query.addTextField('placeholder', '', showPlaceholder);
            query.addButton('OK');
            query.isCancellable = false;
            query.show();

            content = content.replace(new RegExp(placeholder, 'g'),
                                      query.fieldValues.placeholder);
        }
    }

    // if it doens't look much like TaskPaper, bullet each line
    if (!content.match(/^\s*[-+*]\s/gm) && !content.match(/:$/gm))
        content = content.replace(/^/gm, '- ');

    // parse Markdown links
    let link_re = new RegExp('\\[([^\\[]+)\\]\\(([^)]*)\\)', 'gm');
    let links;
    function replace_link(_, p1, p2) {
        links.push(p2);
        return p1;
    }
    function parse_links(line) {
        links = [];
        line = line.replace(link_re, replace_link);
        return [line, ...links];
    }
    content = content.split('\n').flatMap(parse_links).join('\n');

    //send this to OmniFocus
    let cb = CallbackURL.create();
    cb.baseURL = baseURL;
    cb.addParameter('target', target);
    cb.addParameter('content', content);
    // open and wait for result
    let success = cb.open();
    if (success) {
        console.log('Taskpaper added to OF inbox');

        //If there were any placeholders offer to save the changes
        if (placeholders.length) {
            let myPrompt = Prompt.create();
            myPrompt.addButton('Save as new Draft');
            myPrompt.addButton('Update current Draft');
            myPrompt.addButton('Do nothing');
            myPrompt.isCancellable = false;
            myPrompt.show();

            switch(myPrompt.buttonPressed) {
            case 'Save as new Draft':
                let d = Draft.create();
                d.content = content;
                d.update();
                break;
            case 'Update current Draft':
                editor.setText(content);
                break;
            case 'Do nothing':
                break;
            }
        }
    }
    else { // something went wrong or was cancelled
        console.log(cb.status);
        if (cb.status == 'cancel') {
            context.cancel();
        }
        else {
            context.fail();
        }
    }
})();
