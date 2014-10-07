var jua = require('./')

var pull = require('pull-stream')
pull.fromStream = require('stream-to-pull-stream')

var util = require('util')
var fs = require('fs')

pull(
	pull.fromStream.source(fs.createReadStream(__dirname + '/test.jua')),
	jua.tokenizer(),
	jua.parser(function(err, ast) {
		if(err) {
			throw err
		} else {
			console.log(util.inspect(ast, { colors: true, depth: null }))
			console.log('AST: \n%s', ast.toString())
		}
	})
)