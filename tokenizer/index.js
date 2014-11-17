var tokenizer = require('./tokenizer')

module.exports = function() {
	return tokenizer([
		// Comments
		[ /^\/\/([^\n\r]*)/, 'comment:line' ],
		[ /^\/\*/, 'comment:begin' ],
		[ /^\*\//, 'comment:end' ],

		// Keywords
		[ /^(?:function|func|fn)/, 'function' ],
		[ /^if/, 'if' ],
		[ /^for/, 'loop' ],
		[ /^end/, 'end' ],
		[ /^(?:let)/, 'var' ],
		[ /^return/, 'return' ],

		// Literals
		[ /^[0-9]+(?:\.[0-9]+)?/, 'num' ],
		[ /^\.[0-9]+/, 'num' ],

		// TODO: interpolation
		[ /^"((?:[^"]|\\")*)"/, 'string' ],
		[ /^'((?:[^']|\\')*)'/, 'string' ],

		// Constants
		[ /^nil/, 'nil' ],
		[ /^(?:true|false)/, 'bool' ],

		// Whitespace
		[ /^(?:\n|\r|\r\n)/, 'newline' ],
		[ /^\s+/, 'space' ],

		// Operators
		[ /^(?:==|\+|\*|\/|-|\|\||&&|\.\.|\|>|\*\*)/, 'binop' ],
		[ /^=/, 'set' ],

		[ /^\.\.\./, 'vararg' ],
		[ /^_(\^*)(\d*)/, 'select-arg'],

		[ /^,/, 'comma' ],
		[ /^;/, 'seperator' ],

		[ /^\./, 'get' ],
		[ /^:/, 'selfcall' ],

		[ /^#/, 'length' ],

		// Wrapper stuff
		[ /^\(/, 'args:open' ],
		[ /^\)/, 'args:close' ],

		[ /^{/, 'table:open' ],
		[ /^}/, 'table:close' ],

		[ /^\[/, 'dkey:open' ],
		[ /^\]/, 'dkey:close' ],

		[
			(function() {
				var ignoreChars = '\\[\\]\\(\\){}\\.#=\\+\\*\\/\\-\\|&\\s,:"\''
				var re = new RegExp('^[^' + ignoreChars + '\\d' + '][^' + ignoreChars + ']*')
				// console.log(re)
				return re
			})(),
			'id'
		]
	])
}