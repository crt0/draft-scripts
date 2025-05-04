(() => { // anonymous function prevents variable conflicts with other actions
    const ME = 'Andrew';

    function process_markdown_section(input, index) {
        let nonempty = 0;
        let level = '';
        let head_re = /^(#+)\s+/;

        let matches = input[index].match(head_re);
        if (matches)
            level = matches[1];
        let output = [input[index]];

        for (index++; index < input.length; index++) {
            let line = input[index];

            matches = line.match(new RegExp(`^(${level}#+)\\s+`));
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

            if (line.match(/^\s*\*\s/))
                continue;

            if (line.match(/^[^\s]+/))
                nonempty = 1;

            function replace_checkbox(_, bullet, initial) {
                return bullet + ME + ' will ' + initial.toLowerCase();
            }
            line = line.replace(/^(\s*[-+] )\{[- x]\}\s+([^\s])/,
                                replace_checkbox);

            output.push(line);
        }

        return {output: output, index: index};
    }

    const [recip_draft] = Draft.query('title:"Mail Notes Recipients"',
                                      'archive', ['_etc']);
    let name = '';
    let email = '';
    if (recip_draft) {
        const pattern = new RegExp('^' + draft.displayTitle + '\\|.*',
                                   'm');
        const found = recip_draft.content.match(pattern);
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
