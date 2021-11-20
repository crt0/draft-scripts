// Insert Short Date
//
// (Of the format Tue, 8/18)

(() => { // anonymous function prevents variable conflicts with other actions
    const date_options = {
        weekday: 'short',
        month:   'numeric',
        day:     'numeric'
    };

    // replace selection with short date
    editor.setSelectedText((new Date()).toLocaleDateString('en-us',
                                                           date_options));

    // cancel selection
    const range = editor.getSelectedRange();
    editor.setSelectedRange(range[0] + range[1], 0);
})();
