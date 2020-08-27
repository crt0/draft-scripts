// Create Foswiki link
//
// If text in clipboard is NOT a URL:
//
//     - If no text is selected, insert [[][]] at cursor position,
//       leaving cursor ready to type link text
//     - If text is selected, insert [[][selectedText]] leaving
//       cursor in first bracket pair to type URL
//
// If URL in Clipboard:
//
//     - If no text is selected, insert [[urlFromClipboard][]] at
//       cursor position, leaving cursor ready to type link text
//     - If text is selected, insert
//       [[urlFromClipboard][selectedText]] leaving cursor at end

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	
	// helper to test for URL
	function isUrl(s) {
		var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
		return regexp.test(s);
	}
	
	// get clipboard and test if it's a URL
	var clip = app.getClipboard();
	var link = "";
	if (isUrl(clip)) {
		link = clip;
	}
	
	var sel = editor.getSelectedText();
	var selRange = editor.getSelectedRange();
	
	if (!sel || sel.length == 0) {
		editor.setSelectedText("[[" + link + "][]]");
		editor.setSelectedRange(selRange[0] + link.length + 4, 0);
	}
	else {
		editor.setSelectedText("[[" + link + "][" + sel + "]]");
		editor.setSelectedRange(selRange[0] + selRange[1] + link.length + 6, 0);
	}

})();