(() => {
    const BEER_STYLES_UUID = '6F02CDFA-0ECE-4407-85FA-37AA9254104B';

    let workspace = Workspace.create();
    workspace.tagFilter = 'brewery';
    workspace.setArchiveSort('name');
    let brewery_drafts = new Map(workspace.query('archive')
                                          .map(d => [d.displayTitle, d]));

    let styles = ['Unlisted', ...Draft.find(BEER_STYLES_UUID).lines.slice(1)];
    let p = new Prompt();
    let text_options = {autocapitalization: 'words'};
    p.addTextField('name', 'Name', '', text_options);
    p.addPicker('brewery', 'Brewery',
                [Array.from(brewery_drafts.keys())]);
    p.addTextField('new_brewery', 'New Brewery', '', text_options);
    p.addPicker('style', 'Style', [styles]);
    p.addTextField('unlisted_style', 'Unlisted Style', '', text_options);
    p.addSelect('presentation', 'Presentation',
                ['bottle', 'can', 'draft', 'Holzfass', 'nitro'],
                ['draft'], true);
    p.addPicker('score', 'Score',
                [Array(8).fill().map((_, i) => '' + (i * 5 + 15))], [3]);
    p.addDatePicker('date', 'Date', new Date(), {mode: 'date'});
    p.addButton('OK');
    let success = p.show();
    if (!success) {
        context.cancel();
        return;
    }

    let target_draft;
    if (p.fieldValues.new_brewery) {
        target_draft = new Draft();
        target_draft.content = '# ' + p.fieldValues.new_brewery
          + "\n";
    } else {
        target_draft = brewery_drafts.get(p.fieldValues.brewery[0][0]);
    }

    const style = p.fieldValues.unlisted_style || p.fieldValues.style[0];
    const presentation = p.fieldValues.presentation;
    const score = p.fieldValues.score[0];
    let new_entry = `
## ${name}
- Style: ${style}
- Presentation: ${presentation}
- Score: ${score}
`;
    target_draft.append(new_entry);

})();
