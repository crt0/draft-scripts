(() => {
    const BEER_STYLES_UUID = '6F02CDFA-0ECE-4407-85FA-37AA9254104B';

    let workspace = Workspace.create();
    workspace.tagFilter = 'brewery';
    workspace.setAllSort('name');
    let brewery_drafts = new Map(workspace.query('all')
                                          .map(d => [d.displayTitle, d]));

    const breweries = Array.from(brewery_drafts.keys());
    const styles
          = ['Unlisted', ...Draft.find(BEER_STYLES_UUID).lines.slice(1)];
    const scores = Array(8).fill().map((_, i) => '' + (i * 5 + 15));
    let p = new Prompt();
    const text_options = {autocapitalization: 'words'};
    p.addTextField('name', 'Name', '', text_options);
    p.addPicker('brewery', 'Brewery', [breweries]);
    p.addTextField('new_brewery', 'New Brewery', '', text_options);
    p.addPicker('style', 'Style', [styles]);
    p.addTextField('unlisted_style', 'Unlisted Style', '', text_options);
    p.addSelect('presentation', 'Presentation',
                ['bottle', 'can', 'draft', 'Holzfass', 'nitro'],
                ['draft'], true);
    p.addPicker('score', 'Score', [scores], [3]);
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
        target_draft.content = '# ' + p.fieldValues.new_brewery;
        target_draft.addTag('brewery');
    } else {
        target_draft
          = brewery_drafts.get(breweries[p.fieldValues.brewery[0]]);
    }

    const name = p.fieldValues.name;
    const style = p.fieldValues.unlisted_style
          || styles[p.fieldValues.style[0]];
    const presentation = p.fieldValues.presentation;
    const score = scores[p.fieldValues.score[0]];
    const date_options = {
        day:     'numeric',
        month:   'short',
        weekday: 'short',
        year:    'numeric'
    };
    const date = p.fieldValues.date.toLocaleDateString(undefined,
                                                       date_options);
    let new_entry = `
## ${name}
- Style: ${style}
- Presentation: ${presentation}
- Score: ${score}
- Date Logged: ${date}
`;
    target_draft.append(new_entry);
    editor.load(target_draft);
    editor.activate();
})();
