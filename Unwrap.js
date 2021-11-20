(() => {
    editor.setSelectedText(editor.getSelectedText()
                                 .replace(/\n(.)/g, ' $1'));
})();
