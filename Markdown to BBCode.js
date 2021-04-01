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

	const begin_canary = '\u0002';
	const end_canary = '\u0005';
	function add_canaries(text) {
		return begin_canary + text + end_canary;
	}
	function remove_canaries(text) {
		return text.replace(new RegExp('[' + begin_canary + end_canary + ']', 'g'), '');
	}

	const special_chars = '\\`*_{}[]()>#+-.!';
	const special_re = /[\\`*_{}\[\]()>#+.!'-]/g;
	const char_hash = new Map([...special_chars].map(c => [c, String.fromCharCode(c.charCodeAt(0) + 0xE000)]));

	const nested_brackets = '(?:[^\\[\\]]+|\\[(?:[^\\[\\]]+|\\[[^\\[\\]]*\\])*\\])*';
	
	function escape_font_styles(text) {
		return text.replace(/[*_]/g, match => char_hash.get(match));
	}

	function do_anchors(text) {
		let re = new RegExp(`\\[(${nested_brackets})\\]\\([ \\t]*<?(.*?)>?[ \\t]*(?:(['"])(.*?)\\3)?\\)`, 'gs');
		return text.replace(re, (match, link_text, url, quote, title) => '[url=' + escape_font_styles(url) + ']' + link_text + '[/url]');
	}

	function outdent(text) {
		return text.replace(new RegExp(`^(\\t|[ ]{1,${tab_width}})`, 'gm'), '');
	}
	
	function prompt(message) {
		let p = Prompt.create();
		p.message = message;
		p.addButton('OK');
		if (!p.show()) {
			context.cancel();
			exit;
		}
	}
	
	function list_item_recurse(match, leading_line, leading_whitespace, content) {
		let item = remove_canaries(content);
		if (leading_line || item.match(/\n{2,}/))
			item = run_block_gamut(outdent(item));
		else {
			item = do_lists(outdent(item));
			item = item.replace(/\n$/, '');
			item = run_span_gamut(item);
		}

		return '[' + char_hash.get('*') + '] ' + item + '\n';
	}
	
	function process_list_items(list_string, marker_any) {
		list_level++;
		list_string = list_string + end_canary;
		list_string = list_string.replace(new RegExp(`\\n{2,}(?=${end_canary})`), '\n');
		list_string = list_string.replace(new RegExp(`(\\n)?(^[ \\t]*)(?:${marker_any})[ \\t]+((?:.|\\n)+?(\\n{1,2}))(?=\\n*(${end_canary}|\\2(${marker_any})[ \\t]+))`, 'gm'), list_item_recurse);
		list_level--;

		return remove_canaries(list_string);
	}
	
	function do_lists(text) {
		const marker_ul = '[*+-]';
		const marker_ol = '\\d+[.]';
		const marker_any = `(?:${marker_ul}|${marker_ol})`;
		const ul_re = new RegExp(marker_ul);
	
		const whole_list_re = `(([ ]{0,${less_than_tab}}(${marker_any})[ \\t]+)(?:.|\\n)+?(?:${end_canary}|\\n{2,}(?=\\S)(?![ \\t]*${marker_any}[ \\t]+)))`;
		
		const any_list = new RegExp((list_level ? `(^${begin_canary}?)` : `(\\n\\n|${begin_canary}\\n?)`) + whole_list_re, 'gm');
		
		text = add_canaries(text);
		text = text.replace(any_list, (match, bol, whole_list, with_padding, first_marker) => {
			whole_list = remove_canaries(whole_list);
			whole_list = whole_list.replace(/\n{2,}/g, '\n\n\n');
			let result = process_list_items(whole_list, marker_any);
			let list_tag = first_marker.match(ul_re) ? 'list' : 'list=1';
			result = `[${list_tag}]\n` + result + '[/list]\n';
			bol = remove_canaries(bol);
			if (bol === '\n\n')
				result = bol + result;
			return result;
		});

		return remove_canaries(text);
	}

	function detab(text) {
		return text.replace(/(.*?)\t/g, (match, not_tab) => not_tab + ' '.repeat(tab_width - not_tab.length % tab_width));
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

	function encode_code(text) {
		return text.replace(special_re, c => char_hash.get(c));
	}

	function do_code_blocks(text) {
		const re = new RegExp(`(?:\\n\\n|${begin_canary})((?:(?:[ ]{${tab_width}}|\\t).*\\n+)+)((?=^[ ]{0,${tab_width}}\\S)|\\n${end_canary})`, 'gm');
		text = add_canaries(text);
		text = text.replace(re, (match, codeblock) => {
			codeblock = remove_canaries(codeblock);
			codeblock = detab(encode_code(outdent(codeblock)));
			codeblock = codeblock.replace(/^\n+/, '');
			codeblock = codeblock.replace(/\s+\n*$/, '');
			return '\n\n[code]\n' + codeblock + '\n[/code]\n\n';
		});
	
		return remove_canaries(text);
	}
	
	function do_code_spans(text) {
		return text.replace(new RegExp('(`+)(.*?[^`])\\1(?!`)', 'gs'), (match, opener, codeblock) => {
			codeblock = codeblock.replace(/^[ \t]*/g, '');
			codeblock = codeblock.replace(/[ \t]*$/g, '');
			return '[code]' + codeblock + '[/code]';
		});
	}
	
	function do_italics_and_bold(text) {
		text = text.replace(/(\*\*|__)(?=\S)(.+?[*_]*?\S)\1/gs, '[b]$2[/b]');
		text = text.replace(/(\*|_)(?=\S)(.+?\S)\1/gs, '[i]$2[/i]');
		return text;
	}
	
	function form_paragraphs(text) {
		text = text.replace(/^\n+/, '').replace(/\n+$/, '');
		return text.split(/\n{2,}/).map(run_span_gamut).join('\n\n');
	}
	
	function run_block_gamut(text) {
		
		// headings
		text = text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm, (match, hashes, content) => {
			let size = 220 - 20 * hashes.length;
			return `[size=${size}][b]` + run_span_gamut(content) + '[/b][/size]\n\n';
		});
	
		text = do_lists(text);
		text = do_code_blocks(text);
		text = do_blockquotes(text);
		text = form_paragraphs(text);
	
		return text;
	}
	
	function run_span_gamut(text) {
		text = do_code_spans(text);
		text = do_anchors(text);
		text = do_italics_and_bold(text);
		
		return text;
	}

	function unescape_special_chars(text) {
		char_hash.forEach((v, k) => {
			text = text.replace(new RegExp(v, 'g'), k);
		});
		return text;
	}

	function markdown(text) {
		text += '\n\n';
		text = detab(text);
		text = text.replace(/^[ \t]+$/gm, '');
		text = run_block_gamut(text);
		text = unescape_special_chars(text);
		return text + '\n';
	}
	
	draft.content = markdown(draft.content);
})();