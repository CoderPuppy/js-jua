var tokenizer = require('jua-tokenizer')
var ast = require('jua-ast')
var parser = require('./parser')

module.exports = function(cb) {
	var program = ast.program()

	function assertTokenType(tok) {
		var types = [].slice.call(arguments, 1)
		if(types.every(function(type) {
			return tok.type != type
		})) {
			var typesStr
			if(types.length == 1) {
				typesStr = types[0]
			} else {
				typesStr = types.slice(0, -1).join(', ') + ' or ' + types[types.length - 1]
			}

			throw new Error('Expected: ' + typesStr + ' got: ' + tok.type + ' at ' + tok.loc.join(':'))
		}
	}

	var modes = {
		body: function*(body) {
			while(true) {
				var tok = yield null
				switch(tok.type) {
				case 'eof':
					return body

				default:
					p.reparse(tok)
					body.add(yield* modes.expr())
				}
			}
		},

		varlist: function*(end) {
			if(typeof(end) != 'function') end = function() { return false }

			var list = []
			while(true) {
				var tok = yield null
				if(end(tok)) { p.reparse(tok); return list }
				switch(tok.type) {
				case 'seperator':
					break

				case 'eof':
					p.reparse(tok)
					return list

				default:
					p.reparse(tok)
					list.push(yield* modes.expr(function(tok) {
						return tok.type == 'seperator'
					}))
				}
			}
		},

		expr: function*(end) {
			if(typeof(end) != 'function') end = function(tok) { return false }

			var expr

			while(true) {
				var tok = yield null
				if(end(tok)) { p.reparse(tok); return expr }
				if(expr) {
					switch(tok.type) {
				case 'args:open':
					expr = ast.call(
						expr,
						yield* modes.varlist(function(tok) {
							return tok.type == 'args:close'
						})
					)
					assertTokenType(yield null, 'args:close')
					break

				case 'get':
					expr = yield* modes.get(expr)
					break

				case 'binop':
					expr = ast.binop(tok.text, expr, yield* modes.expr())
					break

				case 'dkey:open':
					expr = ast.get(expr, yield* modes.expr(function(tok) {
						return tok.type == 'dkey:close'
					}))
					assertTokenType(yield null, 'dkey:close')
					break

				case 'space':
				case 'newline':
					break

				default:
					console.warn('Unexpected %s at %s in extend mode', tok.type, tok.loc.join(':'))
					p.reparse(tok)
					return expr
				}
				} else {
					switch(tok.type) {
					case 'id':
						expr = ast.get(ast.env, ast.literal(tok.text))
						break

					case 'num':
						expr = ast.literal(parseFloat(tok.text))
						break

					case 'string':
						expr = ast.literal(tok.data[0])
						break

					case 'table:open':
						var entries = yield* modes.table(function(tok) {
							return tok.type == 'table:close'
						})
						assertTokenType(yield null, 'table:close')
						expr = ast.table(entries)
						break

					case 'args:open':
						expr = yield* modes.expr(function(tok) {
							return tok.type == 'args:close'
						})
						assertTokenType(yield null, 'args:close')
						break

					case 'var':
						expr = yield* modes.variable()
						break

					case 'space':
					case 'newline':
						break

					case 'eof':
						throw new SyntaxError('Unexpected eof at ' + tok.loc.join(':') + ' in modes.varlist')

					default:
						console.warn('Unexpected %s at %s in initial mode', tok.type, tok.loc.join(':'))
						p.reparse(tok)
						return expr
					}
				}
			}
		},

		variable: function*() {
			var names = []
			var values
			while(true) {
				var tok = yield null
				switch(tok.type) {
				case 'id':
					names.push(tok.text)
					break

				case 'set':
					values = yield* modes.varlist()
					return ast.variableDeclaration(names, values)

				case 'space':
				case 'seperator':
					break

				case 'eof':
					throw new SyntaxError('Unexpected eof at ' + tok.loc.join(':') + ' in modes.variable')

				default:
					throw new SyntaxError('Unexpected ' + tok.type + ' at ' + tok.loc.join(':') + ' in modes.variable')
				}
			}
		},

		get: function*(expr) {
			while(true) {
				var tok = yield null
				switch(tok.type) {
				case 'id':
					return ast.get(expr, ast.literal(tok.text))
					break

				default:
					throw new Error('Unexpected ' + tok.type + ' at ' + tok.loc.join(':') + ' in modes.get')
				}
			}
		},

		table: function*(end) {
			if(typeof(end) != 'function') end = function(tok) { return false }

			var entries = []

			while(true) {
				var tok = yield null
				if(end(tok)) { p.reparse(tok); return entries }
				switch(tok.type) {
				case 'space':
				case 'newline':
				case 'seperator':
					break

				case 'set':
					throw new Error('Unexpected ' + tok.type + ' at ' + tok.loc.join(':') + ' in modes.table')

				case 'id':
					entries.push(yield* modes.kv(ast.literal(tok.text)))
					break

				case 'dkey:open':
					var key = yield* modes.expr(function(tok) {
						return tok.type == 'dkey:close'
					})
					assertTokenType(yield null, 'dkey:close')
					entries.push(yield* modes.kv(key))
					break

				default:
					p.reparse(tok)
					entries.push(yield* modes.expr(function(tok) {
						return tok.type == 'seperator'
					}))
				}
			}
		},

		kv: function*(key) {
			while(true) {
				var tok = yield null
				switch(tok.type) {
				case 'space':
					break

				case 'set':
					return ast.kv(key, yield* modes.expr())

				default:
					throw new Error('Unexpected ' + tok.type + ' at ' + tok.loc.join(':') + ' in modes.kv')
				}
			}
		}
	}

	var p = parser(function*() {
		return yield* modes.body(program.body)
	}, cb)

	return p
}