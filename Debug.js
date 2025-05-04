let _debug_re = new RegExp(':', 'g');

function _debug_stamp() {
    return (new Date()).toISOString().replace(_debug_re, '');
}

let _debug_filename = '/debug-' + _debug_stamp() + '.log';
let _debug_fm = FileManager.createLocal();
let _debug_buffer = [];

function debug(message) {
    _debug_buffer.push(_debug_stamp() + ': ' + message);
    _debug_fm.writeString(_debug_filename, _debug_buffer.join('\n'));
}
