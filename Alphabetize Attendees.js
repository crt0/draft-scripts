(() => {
    const heading = '## Attendees\n';

    function compare_by_surname(a, b) {
        const a_last = a.match(/[^ ]+$/);
        if (!a_last) return 1;
        const b_last = b.match(/[^ ]+$/);
        if (!b_last) return -1;
        return ('' + a_last[0]).localeCompare(b_last[0]);
    }

    const re = new RegExp('^' + heading + '(.*?)(?=^## |$(?![\r\n]))', 'ms');
    const found = draft.content.match(re);
    if (!found) {
        alert('No attendees section');
        context.fail();
        return;
    }

    const sorted = found[1].split(/\n/).sort(compare_by_surname).join('\n');

    editor.setTextInRange(found.index + heading.length, found[1].length,
                          sorted);
})();
