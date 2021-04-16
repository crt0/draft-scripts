(() => {
	draft.syntax = Syntax.find('builtIn', 'JavaScript');
	editor.setSelectedText('(() => {\n\t\n})();\n');
})();
