// This is a replacement for tokenizer by Floby
// it works about the same except for this using pull-streams instead of new-streams
// I may release this as pull-tokenizer

var pull = require('pull-stream')
pull.pushable = require('pull-pushable')

module.exports = pull.Through(function(read, rules) {
	var out = pull.pushable()
	var buffer = ''
	var loc = [1, 1]

	function check(str) {
		for(var i = 0; i < rules.length; i++) {
			var rule = rules[i]
			var match
			// console.log(str, rule)
			if((match = rule[0].exec(str)) && match.index == 0) {
				// console.log(match)
				return [ match, rule[1] ]
			}
		}
	}

	function drain(more) {
		while(true) {
			var match = check(buffer, !more)
			if(match && (!more || match[0][0].length < buffer.length)) {
				buffer = buffer.slice(match[0][0].length)
				out.push({
					type: match[1],
					text: match[0][0],
					data: match[0].slice(1),
					loc: loc.slice()
				})
				var lines = match[0][0].split(/(?:\r\n|\n|\r)/g)
				if(lines.length > 1) {
					loc[0] += lines.length - 1
					loc[1] = 1 + lines[lines.length - 1].length
				} else {
					loc[1] += match[0][0].length
				}
			} else if(!more && buffer.length > 0) {
				throw new SyntaxError('Unable to tokenize ' + loc.join(':'))
			} else {
				break
			}
		}
	}

	pull.drain(function(text) {
		buffer += text
		drain(true)
	}, function() {
		drain(false)
		out.end()
	})(read)

	return out
})