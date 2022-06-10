// New Brewday Notes
//
// Select from a list of drafts tagged 'brewday' and create a new
// entry in that draft. If no draft is selected, create a new
// draft.

(() => { // anonymous function prevents variable conflicts with other actions

    // create temp workspace to query drafts
    let workspace = Workspace.create();
    workspace.tagFilter = 'brewday';
    workspace.setAllSort('name', false, true);
    // get list of drafts in workspace
    const brewday_drafts = workspace.query('all');

    // prompt to select
    let p = Prompt.create();
    p.title = 'New Brewday Entry';
    p.message = 'Select draft. A new entry will be created in that draft. '
      + 'If no draft is selected, a new draft will be created.';

    p.addPicker('beers', 'Beers', [brewday_drafts.map(d => d.displayTitle)]);
    p.addTextField('new_beer', 'New Beer', '');
    p.addDatePicker('brewdate', 'Brew Date', new Date(), {mode: 'date'})
    p.addButton('OK');

    const ok_clicked = p.show();
    if (!ok_clicked) {
        context.cancel();
        return;
    }

    // use a stored template
    const template_drafts = Draft.query('', 'archive',
                                        ['_brewday_entry', 'template']);
    if (template_drafts.length < 1) {
        context.fail('Create a brewday entry draft tagged with '
                     + '"_brewday_entry" and "template"');
        return;
    }
    let td = template_drafts[0];
    td.setTemplateTag('brewdate', p.fieldValues
                                   .brewdate
                                   .toLocaleString(undefined,
                                                   {dateStyle: 'full'}));
    const section = td.processTemplate(td.content);

    // create a new draft or use the selected one
    let beer_draft;
    if (p.fieldValues.new_beer) {
        beer_draft = Draft.create();
        beer_draft.content = '# ' + p.fieldValues.new_beer.trim() + '\n\n'
          + section;
        beer_draft.addTag('brewday');
        beer_draft.addTag('brewing');
        beer_draft.update();
        editor.load(beer_draft);
    }
    else {
        const selected_beers = p.fieldValues['beers'];
        if (selected_beers.length < 1) {
            context.fail('Must choose a draft or specify a name for a new '
                         + 'one');
            return;
        }

        beer_draft = brewday_drafts[selected_beers[0]];
        editor.load(beer_draft);
        editor.setSelectedRange(beer_draft.title.length + 2, 0);
        editor.setSelectedText(section);
    }

    return true;
})();
