exports.env = {
	type: 'env',

	toString: function() {
		return '<env>'
	}
}

exports.program = function() {
	return {
		type: 'program',
		body: exports.body(),

		toString: function() {
			return this.body.toString()
		}
	}
}

exports.body = function() {
	return {
		type: 'body',
		parts: [],

		add: function(node) {
			if(node)
				this.parts.push(node)
			return this
		},

		toString: function() {
			return this.parts.map(function(part) {
				return part.toString()
			}).join('\n')
		}
	}
}

exports.if = function(conditions, otherwise) {
	return {
		type: 'if',
		conditions: conditions,
		otherwise: otherwise,

		toString: function() {
			var str = this.conditions.map(function(cond, i) {
				if(i == 0)
					return cond.toString()
				else
					return 'else' + cond.toString()
			}).join('')
			if(this.otherwise) {
				str += 'else\n' + this.otherwise.toString() + '\n'
			}
			str += 'end'
			return str
		}
	}
}

exports.cond = function(cond, body) {
	return {
		type: 'if:cond',
		cond: cond,
		body: body,

		toString: function() {
			return 'if ' + cond.toString() + '\n' + body.toString().split('\n').map(function(line) {
				return '\t' + line
			}) + '\n'
		}
	}
}

exports.literal = function(v) {
	return {
		type: 'literal',
		value: v,

		toString: function() {
			return JSON.stringify(this.value)
		}
	}
}

exports.get = function(tbl, k) {
	return {
		type: 'get',
		table: tbl,
		index: k,

		toString: function() {
			return this.table.toString() + '[' + this.index.toString() + ']'
		}
	}
}

exports.call = function(fn, args) {
	return {
		type: 'call',
		func: fn,
		args: args,

		toString: function() {
			return fn.toString() + '(' + args.map(function(arg) {
				return arg.toString()
			}).join(', ') + ')'
		}
	}
}

exports.selfcall = function(self, index, args) {
	return {
		type: 'selfcall',
		self: self,
		index: index,
		args: args,

		toString: function() {
			return this.self.toString() + ':' + this.index.toString() + '(' + args.map(function(arg) {
				return arg.toString()
			}).join(', ') + ')'
		}
	}
}

exports.binop = function(op, a, b) {
	return {
		type: 'binop',
		operator: op,
		operand1: a,
		operand2: b,

		toString: function() {
			return this.operand1.toString() + ' ' + this.operator + ' ' + this.operand2.toString()
		}
	}
}

exports.func = function(args, body) {
	return {
		type: 'function',
		args: args,
		body: body,

		toString: function() {
			if(this.args.length == 0) {
				return '[ ' + this.body.toString() + ' ]'
			} else {
				return '[ ' + this.args.join(', ') + ' => ' + ' ' + this.body.toString() + ' ]'
			}
		}
	}
}

exports.selectArg = function(level, num) {
	return {
		type: 'select-arg',
		level: level,
		num: num,

		toString: function() {
			return '_' + Array(level + 1).join('^') + (num || '')
		}
	}
}

exports.table = function(entries) {
	return {
		type: 'table',
		entries: entries,

		toString: function() {
			return '{\n' + this.entries.map(function(entry) {
				return entry.toString().split(/\r\n|\r|\n/).map(function(line) {
					return '\t' + line
				}).join('\n') + ';'
			}).join('\n') + '\n}'
		}
	}
}

exports.kv = function(key, val) {
	return {
		type: 'kv',
		key: key,
		val: val,

		toString: function() {
			return '[' + this.key.toString() + '] = ' + this.val.toString()
		}
	}
}

exports.variableDeclaration = function(names, values) {
	return {
		type: 'var-decl',
		names: names,
		values: values,

		toString: function() {
			return 'let ' + this.names.join(', ') + ' = ' + this.values.map(function(value) {
				return value.toString()
			}).join(', ')
		}
	}
}