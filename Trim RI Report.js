// Trim RI Report
//
// Remove items you don't want from the REN-ISAC Daily Watch Report
//
// Configure the variable definitions below as follows:
// - remove_sections: headings of sections you don't want
// - remove_vulns: platforms for which vulns you don't want
// - remove_paragraphs: prefixes of paragraphs you don't want
// - remove_prefixes: prefixes you want removed from paragraphs
//   (keeping the paragraphs)

(() => { // anonymous function prevents variable conflicts with other Drafts actions

	const remove_sections = ["PRIVACY", "AUDIO/PODCAST", "UPCOMING CONFERENCES, WORKSHOPS, TRAINING, ETC.", "REFERENCES"];
	const remove_vulns = ["Debian:", "Debian LTS:", "Red Hat:", "SUSE:", "Ubuntu:", "FreeBSD:", "Android:", "Pixel:", "US-CERT", "ICS-CERT", "Juniper:"];
	const remove_paragraphs = ["KEYWORDS: "];
	const remove_prefixes = ["ARTICLE PREVIEW: ", "FULL ARTICLE: "];
	const remove_patch_tuesday = true;
	
	function compare_line(element) {
		return element === this.replace(/ *$/, "");
	}
	
	function compare_line_prefix(element) {
		return this.match(new RegExp("^" + element));
	}
	
	function wanted_lines(line, index, lines) {

		// Are we still in the previous state? If so, return false
		// because we don't want the line
		switch (this.state) {
		case "unwanted_section":
			if (!line.match(/^[A-Z]{2,}/) || !lines[index + 1].match(/^=+\s*$/))
				return false;
			break;
		case "unwanted_patch_tuesday":
			if (line.match(/^--- \[End of Microsoft Patch Tuesday Section\] ---\s*$/)) {
				this.state = "wanted";
			} else if (line.match(/^[A-Z]{2,}/) && lines[index + 1].match(/^=+\s*$/)) {
				this.state = "wanted";
				break;
			}
			return false;
		case "unwanted_vuln":
			if (line.match(/^----- *$/))
				this.state = "wanted";
			return false;
		case "unwanted_paragraph":
			if (!line.match(/^\s*$/))
				return false;
			break;
		}
		
		// Are we in a new state? If so, return false because we
		// don't want the line
		if (remove_sections.some(compare_line, line)) {
			this.state = "unwanted_section";
			return false;
		}
		else if (remove_patch_tuesday && line.match(/^Microsoft:.*"Patch Tuesday" Security Update Release\s*$/)) {
			this.state = "unwanted_patch_tuesday";
			return false;
		}
		else if (remove_vulns.some(compare_line, line)) {
			this.state = "unwanted_vuln";
			return false;
		}
		else if (remove_paragraphs.some(compare_line_prefix, line)) {
			this.state = "unwanted_paragraph";
			return false;
		}
		
		this.state = "wanted";
		
		// Don't create consecutive blank lines
		if (index > 0 && line.match(/^\s*$/) && lines[index - 1].match(/^\s*$/))
			return false;
		
		// We want this line
		return true;
	}
	
	function remove_unwanted_prefixes(line) {
		let prefix_to_remove = remove_prefixes.find(compare_line_prefix, line);
		return prefix_to_remove ? line.replace(new RegExp("^" + prefix_to_remove), "") : line;
	}
	
	function collapse_blank_lines(line, index, lines) {
		return index == 0 || !line.match(/^\s*$/) || !lines[index - 1].match(/^\s*$/);
	}
	
	editor.linkModeEnabled = true;
	
	let this_arg = {"state": "wanted"};
	draft.content = draft.lines.filter(wanted_lines, this_arg).filter(collapse_blank_lines).map(remove_unwanted_prefixes).join("\n");
	draft.update();
})();