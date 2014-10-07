var ast = require('./')

module.exports = ast.if([
	ast.cond(
		ast.literal(true),
		ast.call(
			ast.get(ast.env, ast.literal('print')),
			[]
		)
	)
])
console.log(module.exports.toString())