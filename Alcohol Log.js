// Alcohol Log
//
// Optionally log an alcoholic drink, then display how many more drinks are
// allowed that day before exceeding a pre-configured amount for the week.

(() => { // anonymous function prevents variable conflicts with other Drafts actions
    function format_date(date) {
        let d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    const drink_type = {
        beer:   12,
        spirit: 1.5,
        wine:   5
    };
    const beer_default_abv = 5;
    const header = '# Alcohol Log\n';
    const max_drinks = 14.0;

    const drafts = Draft.query('title:"Alcohol Log"', 'all', ['_log']);
    let log;
    if (drafts && drafts[0])
        log = drafts[0];
    else {
        log = new Draft();
        log.content = header;
        log.addTag('_log');
        log.update();
    }

    const today = new Date();
    let p = Prompt.create();
    p.addSelect('type', 'Type', Object.keys(drink_type), ['beer']);
    p.addDatePicker('query_date', 'Query Date', today, {mode: 'date'});
    p.addDatePicker('log_date', 'Log Date', today, {mode: 'date'});
    p.addButton('Log & Query', 'log', true);
    p.addButton('Query Only', 'nolog', false);

    let proceed = p.show();
    if (!proceed) {
        context.cancel();
        return;
    }

    const log_stamp = format_date(p.fieldValues.log_date);
    const begin_stamp = format_date(adjustDate(p.fieldValues.query_date,
                                               '-6 days'));

    let query_day;
    if (format_date(p.fieldValues.query_date) === format_date(today))
        query_day = 'today';
    else {
        let f = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
        query_day = f.format(p.fieldValues.query_date);
    }
    
    if (p.buttonPressed === 'log') {
        const type = p.fieldValues.type[0];
        p = Prompt.create();
        p.addTextField('floz', 'Volume (fl. oz.)', drink_type[type]);
        if (type === 'beer')
            p.addTextField('beer_abv', 'Beer ABV (%)', beer_default_abv);
        p.addButton('OK');

        proceed = p.show();
        if (!proceed) {
            context.cancel();
            return;
        }

        const entry = [log_stamp, type,
                       type === 'beer'
                           ? p.fieldValues.beer_abv / beer_default_abv : 1,
                       p.fieldValues.floz].join(':') + '\n';
        log.content = header + entry + log.content.replace(/[^\n]*\n/, '');
        log.update();
    }

    let drinks = 0.0;
    for (const line of log.lines) {
        const field = line.split(/:/);
        if (!field[0].match(/^\d{4}-\d{2}-\d{2}$/))
            continue;
        if (begin_stamp.localeCompare(field[0]) == 1)
            break;
        drinks += parseFloat(field[3]) / parseFloat(drink_type[field[1]])
          * field[2];
    }

    p = Prompt.create();
    p.message = 'Drinks past 7 days: ' + drinks.toFixed(1) +
          '\nDrinks left ' + query_day + ': ' + (max_drinks - drinks).toFixed(1);
    p.addButton('OK');
    p.show();
})();