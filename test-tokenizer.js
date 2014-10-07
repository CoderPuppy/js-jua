const jua     = require('jua')
jua.parser    = require('jua-parser')
jua.tokenizer = require('jua-tokenizer')

const pull = require('pull-stream')
pull.fromStream = require('stream-to-pull-stream')

const fs = require('fs')

pull(
	pull.fromStream.source(fs.createReadStream(__dirname + '/test.jua')),
	jua.tokenizer(),
	pull.map(function(token) {
		var res = token.type + ': "' + token.text + '"'
		if(token.data.length > 0) {
			res += ' (' + token.data.join(', ') + ')'
		}
		return res
	}),
	pull.log()
)