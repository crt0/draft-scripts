(() => {
    function appointment(topic, date, offset, duration, location, alert) {
        const date_options = {
            day:     'numeric',
            hour:    'numeric',
            hour12:  false,
            minute:  'numeric',
            month:   'numeric',
            weekday: 'short',
            year:    'numeric'
        };
        let new_date = new Date(date.valueOf());
        new_date.setMinutes(new_date.getMinutes() + offset, 0);
        let base = new_date.toLocaleString(undefined, date_options) + ' '
            + topic + ' ' + duration + 'm';
        if (location)
            base += ' at ' + location;
        let results = base + " alert none /ajk\n";
        results += base + ' alert ' + (alert || 'none') + " /akorty\n";

        return results;
    }

    let p = Prompt.create();
    p.addTextField('topic', 'Topic', '');
    p.addDatePicker('date', 'Date of Appointment', new Date(),
                         {'mode': 'dateAndTime'});
    p.addTextField('duration', 'Duration', 60);
    p.addTextField('travel', 'Travel Time', 30);
    p.addTextField('location', 'Location', '{{location}}');
    p.addButton('OK');
    let status = p.show();

    let topic = p.fieldValues.topic;
    let date = p.fieldValues.date;
    let duration = parseInt(p.fieldValues.duration);
    let travel = parseInt(p.fieldValues.travel);
    let appointments = appointment(topic, date, 0, duration);

    appointments += appointment('Travel to ' + topic, date, -travel, travel,
                                p.fieldValues.location, '0');
    appointments += appointment('Travel from ' + topic, date, duration,
                                travel);

    editor.setSelectedText(appointments);
})();
