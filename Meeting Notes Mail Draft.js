(() => { // anonymous function prevents variable conflicts with other actions

    const recip_drafts = Draft.query('Mail Notes Recipients', 'archive',
                                    ['_etc']);
    let name = '';
    let email = '';
    if (recip_drafts && recip_drafts[0]) {
        const pattern = new RegExp('^' + draft.displayTitle + '\\|.*', 'm');
        const found = recip_drafts[0].content.match(pattern);
        if (found) {
            const fields = found[0].split(/\|/, 3);
            name = fields[1];
            email = fields[2].trim();
        }
    } else {
        let p = Prompt.create();
        p.title = 'Recipients';
        p.message = 'Recipients to be named in the salutation:';
        p.addTextField('recipients', 'Recipients', '');
        p.addButton('OK');
        const ok_clicked = p.show();
        if (!ok_clicked) {
            context.cancel();
            return;
        }
        name = p.fieldValues.recipients;
    }

    let body = '';
    draft.setTemplateTag('notes_subject', draft.displayTitle + ' notes');
    if (name) {
        body = 'Hi, ' + name +
          '. Thanks for taking the time to meet. Here are my notes.\n';
    }

    const found = draft.content.match(/\n(.*)/s);
    if (found) {
        body += found[1]; //.replace(/^(#+)/gm, '$1#'); // shrink headings
    }

    if (email) {
        draft.setTemplateTag('notes_email', email);
    }

    draft.setTemplateTag('notes_body', body);
})();
