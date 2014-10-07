var ast = require('jua-ast')

var shortNames = {
	env: 'E',
	stack: 'S',

	jua: 'J',

	wrapObject: 'WO',
	get: 'G'
}

var compilers = {
	'if': function(node, gen) {
		var root = {}
		var current = root

		for(var i = 0; i < node.conditions.length; i++) {
			current = current.alternate = {
				type: 'ConditionalExpression',
				test: gen.compile(node.conditions[i].cond),
				consequent: gen.compile(node.conditions[i].body)
			}
		}
		current.alternate = gen.compile(node.otherwise || ast.literal(null))

		return root.alternate
	},

	literal: function(node, gen) {
		var literal = {
			type: 'Literal',
			value: node.value
		}

		if(node.value === null || node.value === undefined || node.value === true || node.value === false || typeof(node.value) == 'number')
			return literal

		return {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: {
					type: 'Identifier',
					name: gen.name('jua')
				},
				property: {
					type: 'Identifier',
					name: gen.name('wrapObject'),
				}
			},
			arguments: [ literal ]
		}
	},

	call: function(node, gen) {
		return {
			type: 'CallExpression',
			callee: gen.compile(node.func),
			arguments: [
				{
					type: 'Identifier',
					name: gen.name('stack')
				}
			].concat(node.args.map(gen.compile))
		}
	},

	get: function(node, gen) {
		return {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: {
					type: 'Identifier',
					name: gen.name('jua')
				},
				property: {
					type: 'Identifier',
					name: gen.name('get')
				},
				computed: false
			},
			arguments: [
				{
					type: 'Identifier',
					name: gen.name('stack')
				},
				gen.compile(node.table),
				gen.compile(node.index)
			]
		}
	},

	env: function(node, gen) {
		return {
			type: 'Identifier',
			name: gen.name('env')
		}
	}
}

function compile(node, options) {
	if(typeof(options) != 'object' || options === null) options = {}

	if(typeof(compilers[node.type]) == 'function')
		return compilers[node.type](node, {
			name: function(name) {
				if(options.shortNames)
					return shortNames[name]
				else
					return name
			},
			compile: function(node) {
				return compile(node, options)
			}
		})
	else
		throw new Error('No compiler for: ' + node.type + ': \n' + node.toString())
}
compile.stringify = require('escodegen').generate
module.exports = compile