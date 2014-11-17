// This is a replacement for parser by Floby
// it works about the same except for this using pull-streams instead of new-streams
// I may release this as pull-parser

var pull = require('pull-stream')

module.exports = function(gen, cb) {
	if(typeof(gen) == 'function') gen = gen()

	var done = false

	var queue = [null]

	function parseTokens() {
		if(done) return

		while(queue.length > 0) {
			try {
				var tok = queue.shift()
				// console.log(tok)
				var res = gen.next(tok)
				// console.log(tok, res)
				if(res.done) {
					done = true
					cb(null, res.value)
				}
			} catch(e) {
				done = true
				cb(e)
			}
		}
	}

	parseTokens()

	var lastLoc

	var p = pull.drain(function(tok) {
		lastLoc = tok.loc.slice()

		var lines = tok.text.split(/(?:\r\n|\n|\r)/g)
		if(lines.length > 1) {
			lastLoc[0] += lines.length - 1
			lastLoc[1] = 1 + lines[lines.length - 1].length
		} else {
			lastLoc[1] += tok.text.length
		}

		queue.push(tok)
		parseTokens()
	}, function() {
		queue.push({ type: 'eof', text: '', loc: lastLoc })
		parseTokens()
		if(!done) {
			try {
				gen.throw(new Error('Somthing more is expected at ' + lastLoc.join(':')))
			} catch(e) {
				cb(e)
			}
		}
	})

	p.reparse = function(tok) {
		queue.push(tok)
		return p
	}

	return p
}