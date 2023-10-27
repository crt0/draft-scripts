(() => {
    let p = new Prompt();
    p.addTextField('adjustment', 'Date Adjustment', '');
    p.addButton('OK');
    const success = p.show();
    if (!success) {
        context.cancel();
        return;
    }

    const adjusted_date = adjustDate(new Date(), p.fieldValues.adjustment);
    const date_options = {
        day:     'numeric',
        month:   'numeric',
        weekday: 'short',
        year:    '2-digit'
    };
    const formatted_date
          = adjusted_date.toLocaleString(undefined, date_options)
                         .replace(/.,/, '');
    draft.setTemplateTag('picked_date', formatted_date);
})();
