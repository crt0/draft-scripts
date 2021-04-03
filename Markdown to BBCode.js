/*

This software is derived from John Gruber's Markdown implementation and
thus carries the same license:

Copyright (c) 2004, John Gruber  
<http://daringfireball.net/>  
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright
  notice, this list of conditions and the following disclaimer in the
  documentation and/or other materials provided with the distribution.

* Neither the name "Markdown" nor the names of its contributors may
  be used to endorse or promote products derived from this software
  without specific prior written permission.

This software is provided by the copyright holders and contributors "as
is" and any express or implied warranties, including, but not limited
to, the implied warranties of merchantability and fitness for a
particular purpose are disclaimed. In no event shall the copyright owner
or contributors be liable for any direct, indirect, incidental, special,
exemplary, or consequential damages (including, but not limited to,
procurement of substitute goods or services; loss of use, data, or
profits; or business interruption) however caused and on any theory of
liability, whether in contract, strict liability, or tort (including
negligence or otherwise) arising in any way out of the use of this
software, even if advised of the possibility of such damage.

*/

(() => { // anonymous function prevents variable conflicts with other Drafts actions
	const tab_width = 4;
	const less_than_tab = tab_width - 1;
	let list_level = 0;

	// Gruber makes heavy use of Perl regular expression features \A,
	// \Z, and \z, which don't exist in Javascript. We emulate these
	// features by inserting "tracers," private-use Unicode
	// characters that aren't likely to appear in the user's text, at
	// the beginning and end of strings, and then match on those. We
	// have to be careful because we might match them accidentally
	// (with ^. for example).
	const begin_tracer = '\uE000';
	const end_tracer = '\uE001';
	function add_tracers(text) {
		return begin_tracer + text + end_tracer;
	}
	function remove_tracers(text) {
		return text.replace(new RegExp('[' + begin_tracer + end_tracer + ']', 'g'), '');
	}

	// Gruber uses MD5 hashes to temporarily replace characters that
	// might accidentally get interpreted by Markdown processing, but
	// MD5 would require an external library for us, so we instead
	// map these special characters into a Unicode  private use area
	const special_chars = '\\`*_{}[]()>#+-.!';
	const special_re = /[\\`*_{}\[\]()>#+.!'-]/g;
	const char_hash = new Map([...special_chars].map(c => [c, String.fromCharCode(c.charCodeAt(0) + 0xE000)]));

	// I'm not sure how to replicate Gruber's recursive regex to
	// match nested brackets, so the following just matches two
	// nested pairs
	const nested_brackets = '(?:[^\\[\\]]+|\\[(?:[^\\[\\]]+|\\[[^\\[\\]]*\\])*\\])*';

	function escape_font_styles(text) {
		return text.replace(/[*_]/g, match => char_hash.get(match));
	}

	// Gruber: "Main function. The order in which other subs are
	// called here is essential."
	function markdown(text) {
		text += '\n\n';
		text = detab(text);
		text = text.replace(/^[ \t]+$/gm, '');
		text = run_block_gamut(text);
		text = unescape_special_chars(text);
		return text + '\n';
	}

	// Gruber: "These are all the transformations that form
	// block-level tags like paragraphs, headers, and list items."
	function run_block_gamut(text) {
		text = do_headers(text);

		// protect horizontal rules but don't render (no BBCode equivalent)
		text = text.replace(/^[ ]{0,2}([ ]?[*_-][ ]?){3,}[ \t]*$/gm, match => match.replace(/[*_-]/g, c => char_hash.get(c)));

		text = do_lists(text);
		text = do_code_blocks(text);
		text = do_blockquotes(text);
		text = form_paragraphs(text);
	
		return text;
	}

	// Gruber: "These are all the transformations that occur *within*
	// block-level tags like paragraphs, headers, and list items."
	function run_span_gamut(text) {
		text = do_code_spans(text);
		text = escape_special_chars(text);
		text = do_anchors(text);
		text = do_italics_and_bold(text);
		return text;
	}

	function escape_special_chars(text) {
		let tokens = tokenize_html(text);
		let result = '';

		tokens.forEach(item => {
			if (item[0] === 'tag') {
				item[1] = item[1].replace(/[*_]/g, c => char_hash.get(c));
				result += item[1];
			}
			else
				result += encode_backslash_escapes(item[1]);
		});

		return result;
	}

	// Turn Markdown link shortcuts into BBCode [url] tags
	function do_anchors(text) {
		let re = new RegExp(`\\[(${nested_brackets})\\]\\([ \\t]*<?(.*?)>?[ \\t]*(?:(['"])(.*?)\\3)?\\)`, 'gs');
		return text.replace(re, (match, link_text, url, quote, title) => '[url=' + escape_font_styles(url) + ']' + link_text + '[/url]');
	}

	// Setext-style headers aren't supported, just ATX-style
	function do_headers(text) {
		return text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm, (match, hashes, content) => {
			let size = 220 - 20 * hashes.length;
			return `[size=${size}][b]` + run_span_gamut(content) + '[/b][/size]\n\n';
		});
	}

	// Form BBCode ordered (numbered) and unordered (bulleted) lists
	function do_lists(text) {
		// Re-usable patterns to match list item bullets and number
		// markers
		const marker_ul = '[*+-]';
		const marker_ol = '\\d+[.]';
		const marker_any = `(?:${marker_ul}|${marker_ol})`;
		const ul_re = new RegExp(marker_ul);

		// Re-usable pattern to match any entirel ul or ol list
		const whole_list_re = `(([ ]{0,${less_than_tab}}(${marker_any})[ \\t]+)(?:.|\\n)+?(?:${end_tracer}|\\n{2,}(?=\\S)(?![ \\t]*${marker_any}[ \\t]+)))`;

		// Gruber: "We use a different prefix before nested lists
		// than top-level lists. See extended comment in
		// [process_list_tems()]."
		const any_list = new RegExp((list_level ? `(^${begin_tracer}?)` : `(\\n\\n|${begin_tracer}\\n?)`) + whole_list_re, 'gm');

		text = add_tracers(text);
		text = text.replace(any_list, (match, bol, whole_list, with_padding, first_marker) => {
			whole_list = remove_tracers(whole_list);
			whole_list = whole_list.replace(/\n{2,}/g, '\n\n\n');
			let result = process_list_items(whole_list, marker_any);
			let list_tag = first_marker.match(ul_re) ? 'list' : 'list=1';
			result = `[${list_tag}]\n` + result + '[/list]\n';
			bol = remove_tracers(bol);
			if (bol === '\n\n')
				result = bol + result;
			return result;
		});

		return remove_tracers(text);
	}

	function list_item_recurse(match, leading_line, leading_whitespace, content) {
		let item = remove_tracers(content);

		if (leading_line || item.match(/\n{2,}/))
			item = run_block_gamut(outdent(item));
		else {
			item = do_lists(outdent(item));
			item = item.replace(/\n$/, '');
			item = run_span_gamut(item);
		}

		return '[' + char_hash.get('*') + '] ' + item + '\n';
	}

	// Gruber: "Process the contents of a single ordered or unordered
	// list, splitting it into individual list items. The
	// [list_level] global keeps track of when we're inside a list.
	// Each time we enter a list, we increment it; when we leave a
	// list, we decrement. If it's zero, we're not in a list anymore.
	//
	// We do this because when we're not inside a list, we want to
	// treat something like this:
	//
	//		I recommend upgrading to version
	//		8. Oops, now this line is treated
	//		as a sub-list.
	//
	// as a single paragraph, despite the fact that the second line
	// starts with a digit-period-space sequence.
	//
	// Whereas when we're inside a list (or sub-list), that line will
	// be treated as the start of a sub-list. What a kludge, huh?
	// This is an aspect of Markdown's syntax that's hard to parse
	// perfectly without resorting to mind-reading."
	function process_list_items(list_string, marker_any) {
		list_level++;
		list_string = list_string + end_tracer;
		list_string = list_string.replace(new RegExp(`\\n{2,}(?=${end_tracer})`), '\n');
		list_string = list_string.replace(new RegExp(`(\\n)?(^[ \\t]*)(?:${marker_any})[ \\t]+((?:.|\\n)+?(\\n{1,2}))(?=\\n*(${end_tracer}|\\2(${marker_any})[ \\t]+))`, 'gm'), list_item_recurse);
		list_level--;
		return remove_tracers(list_string);
	}

	// Process Markdown [code] blocks
	function do_code_blocks(text) {
		const re = new RegExp(`(?:\\n\\n|${begin_tracer})((?:(?:[ ]{${tab_width}}|\\t).*\\n+)+)((?=^[ ]{0,${tab_width}}\\S)|\\n${end_tracer})`, 'gm');

		text = add_tracers(text);
		text = text.replace(re, (match, codeblock) => {
			codeblock = remove_tracers(codeblock);
			codeblock = detab(encode_code(outdent(codeblock)));
			codeblock = codeblock.replace(/^\n+/, '');
			codeblock = codeblock.replace(/\s+\n*$/, '');
			return '\n\n[code]\n' + codeblock + '\n[/code]\n\n';
		});

		return remove_tracers(text);
	}

	// We translate backticks to [code], even though the latter
	// doesn't do inline code. This should probably be changed to
	// [inline] when that has broader support. Gruber: "You can use
	// multiple backticks as the delimiters if you want to include
	// literal backticks in the code span. ... There's no arbitrary
	// limit to the number of backticks you can use as delimters. If
	// you need three consecutive backticks in your code, use four
	// for delimiters, etc.
	//
	// You can use spaces to get literal backticks at the edges:
	//
	//		... type `` `bar` `` ...
	//
	// Turns to:"
	//
	//		... type [code]`bar`[/code] ...
	function do_code_spans(text) {
		return text.replace(new RegExp('(`+)(.*?[^`])\\1(?!`)', 'gs'), (match, opener, codeblock) => {
			codeblock = codeblock.replace(/^[ \t]*/g, '');
			codeblock = codeblock.replace(/[ \t]*$/g, '');
			return '[code]' + codeblock + '[/code]';
		});
	}

	// Gruber: "Encode/escape certain characters inside Markdown code
	// runs. The point is that in code, these characters are
	// literals, and lose their special Markdown meanings."
	function encode_code(text) {
		return text.replace(special_re, c => char_hash.get(c));
	}

	function do_italics_and_bold(text) {

		// [b] must go first:
		text = text.replace(/(\*\*|__)(?=\S)(.+?[*_]*?\S)\1/gs, '[b]$2[/b]');

		text = text.replace(/(\*|_)(?=\S)(.+?\S)\1/gs, '[i]$2[/i]');

		return text;
	}

	function do_blockquotes(text) {
		return text.replace(/(^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+/gm, bq => {
			bq = bq.replace(/^[ \t]*>[ \t]?/gm, '');
			bq = bq.replace(/^[ \t]+$/gm, '');
			bq = run_block_gamut(bq);
			
			bq = bq.replace(/^/g, '  ');
			bq = bq.replace(/\s*\[code\].+?\[\/code\]/, match => match.replace(/^  /gm, ''));
			return '[quote]\n' + bq + '\n[/quote]\n\n';
		});
	}

	function form_paragraphs(text) {

		// Strip leading and trailing lines
		text = text.replace(/^\n+/, '').replace(/\n+$/, '');

		return text.split(/\n{2,}/).map(t => run_span_gamut(t).replace(/^[ \t]*/, '')).join('\n\n');
	}

	function encode_backslash_escapes(text) {
		return text
			.replace(/\\\\/g, char_hash.get('\\'))
			.replace(/\\'/g , char_hash.get('`' ))
			.replace(/\\\*/g, char_hash.get('*' ))
			.replace(/\\_/g , char_hash.get('_' ))
			.replace(/\\\{/g, char_hash.get('{' ))
			.replace(/\\\}/g, char_hash.get('}' ))
			.replace(/\\\[/g, char_hash.get('[' ))
			.replace(/\\\]/g, char_hash.get(']' ))
			.replace(/\\\(/g, char_hash.get('(' ))
			.replace(/\\\)/g, char_hash.get(')' ))
			.replace(/\\>/g , char_hash.get('>' ))
			.replace(/\\\#/g, char_hash.get('#' ))
			.replace(/\\\+/g, char_hash.get('+' ))
			.replace(/\\\-/g, char_hash.get('-' ))
			.replace(/\\\./g, char_hash.get('.' ))
			.replace(/\\!/g,  char_hash.get('!' ));
	}

	// Swap back in all the special characters we've hidden
	function unescape_special_chars(text) {
		char_hash.forEach((v, k) => {
			text = text.replace(new RegExp(v, 'g'), k);
		});
		return text;
	}

	// Returns an array of tokenized HTML tags from the input string.
	// Each token is either a tag (possibly with nested tags
	// contained therein, such as <a href="<MTFoo>">, or a run of
	// text between tags. Each element of the array is a two-element
	// array; the first is either 'tag' or 'text'; the second is the
	// actual value.
	function tokenize_html(text) {
		let pos = 0;
		let len = text.length;
		let tokens = [];

		let depth = 6;
		let nested_tags = Array(depth).fill('(?:<[a-z/!$](?:[^<>]').join('|') + ')*>)'.repeat(depth);
		let re = new RegExp(`(?:<!(--(?:.|\\n)*?--\\s*)+>)|(?:<\?(?:.|\\n)*?\\?>)|${nested_tags}`, 'gi');

		let whole_tag = '';
		let found;
		while ((found = re.exec(text))) {
			let whole_tag = found[0];
			let sec_start = found.index;
			let tag_start = sec_start - whole_tag.length;
			if (pos < tag_start)
				tokens.push(['text', text.substr(pos, tag_start - pos)]);
			tokens.push(['tag', whole_tag]);
			pos = sec_start;
		}
		if (pos < len)
			tokens.push(['tag', text.substr(pos, len - pos)]);

		return tokens;
	}

	// Remove one level of line-leading tabs or spaces
	function outdent(text) {
		return text.replace(new RegExp(`^(\\t|[ ]{1,${tab_width}})`, 'gm'), '');
	}

	function detab(text) {
		return text.replace(/(.*?)\t/g, (match, not_tab) => not_tab + ' '.repeat(tab_width - not_tab.length % tab_width));
	}

	app.setClipboard(markdown(draft.content));
})();