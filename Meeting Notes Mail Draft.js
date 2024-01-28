(() => { // anonymous function prevents variable conflicts with other actions
    const ME = 'Andrew';

    const recip_drafts = Draft.query('Mail Notes Recipients', 'archive',
    function process_markdown_section(input, index) {
        let nonempty = 0;
        let level = '';

        let head_re        = new RegExp('^(#+)\\s+');
        let nonempty_re    = new RegExp('^[^\\s]+');
        let hidden_item_re = new RegExp('^\\s*\\*\\s');
        let task_re        = new RegExp('^(\\s*[-+] ){[- x]}\\s+([^\\s])');

        let matches = input[index].match(head_re);
        if (matches)
            level = matches[1];
        let output = [input[index]];

        for (index++; index < input.length; index++) {
            let nested_re = new RegExp(`^(${level}#+)\\s+`);
            let line = input[index];

            matches = line.match(nested_re);
            if (matches) {
                let result = process_markdown_section(input, index);
                if (result.output.length) {
                    output.push(...result.output);
                    nonempty = 1;
                }
                index = result.index - 1;
                continue;
            }

            matches = line.match(head_re);
            if (matches)
                if (nonempty)
                    return {output: output, index: index};
                else
                    return {output: [], index: index};

            if (line.match(hidden_item_re))
                continue;

            if (line.match(nonempty_re))
                nonempty = 1;

            line = line.replace(task_re, `$1${ME} will `
                                + "$2".toLowerCase());

            output.push(line);
        }

        return {output: output, index: index};
    }

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
    draft.setTemplateTag('notes_subject', '[RECAP] ' + draft.displayTitle);
    if (name) {
        body = 'Hi, ' + name +
          '. Thanks for taking the time to meet. Here are my notes.\n';
    }



    const found = draft.content.match(/\n(.*)/s);
    if (found) {
        let {output} = process_markdown_section(found[1].split('\n'), 0);
        if (output)
            body += output.join('\n');
        else
            body += found[1];
    }

    if (email) {
        draft.setTemplateTag('notes_email', email);
    }

    draft.setTemplateTag('notes_body', body);
})();
