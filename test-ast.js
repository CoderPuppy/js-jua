var ast = require('./').ast

module.exports = ast.if([
	ast.cond(
		ast.literal(true),
		ast.call(
			ast.get(ast.env, ast.literal('print')),
			[
				ast.literal(1),
				ast.literal(2),
				ast.literal(3)
			]
		)
	)
])
console.log(module.exports.toString())