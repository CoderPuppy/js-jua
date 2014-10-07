var Map = require('es6-map')

var J = exports

J.T = J.tbl = J.table = function() {
	var data = Object.create(Map.prototype); Map.apply(data, arguments)

	var tbl = {}

	tbl.RG = tbl.rawget = function(k) { return data.get(k) }
	tbl.G = tbl.get = function(S, k) {
		var fn
		if(J.table.is(tbl.mt) && typeof(fn = tbl.mt.G(S, 'get')) == 'function') {
			return fn(S, tbl, k)[0]
		} else {
			return tbl.rawget(k)
		}
	}

	tbl.RS = tbl.rawset = function(k, v) { data.set(k, v) }
	tbl.S = tbl.set = function(S, k, v) {
		var fn
		if(J.table.is(tbl.mt) && typeof(fn = tbl.mt.G(S, 'set')) == 'function') {
			return fn(S, tbl, k, v)[0]
		} else {
			return tbl.rawset(k, v)
		}
	}

	return tbl
}
J.table.is = function(tbl) {
	return 
}

J.S = J.set = function(tbl, k, v) {
	tbl.set(k, v)
}

J.G = J.get = function(tbl, k) {
	return tbl.get(k)
}

J.L = J.loc = J.local = function(E, name, initial) {
	Object.defineProperty(E, name, {
		writeable: true,
		configurable: true,
		enumerable: true,
		value: initial === undefined ? null : initial
	})
}

J.createEnv = function(parent) {
	var env = J.tbl()
	env.mt = J.tbl()
	env.mt.set('get', J.function(env, [], function*(E, S, A) {
		// if(A[0].get())
	}))
	return env
}

J.F = J.fn = J.func = J.function = function(lexical, argNames, fn) {
	if(!Array.isArray(argNames)) throw new TypeError('argNames needs to be an array')

	return function*(S) {
		var E = J.createEnv(lexical)

		var A = [].slice.call(arguments, 1)
		argNames.forEach(function(name, i) {
			E[name] = A[i]
		})

		var frame = {
			env: E,
			loc: (function() {
				try {
					fn().throw(new Error())
					return fn.name
				} catch(e) {
					return e.stack.split('\n')[1].replace(/^\s*at\s*/, '')
				}
			})()
		}

		S = S.concat([ frame ])

		console.log('Running %s', frame.loc)
		console.log(J.printStack(S))
		console.log()

		return yield* fn(E, S, A)
	}
}

J.runSync = function(gen) {
	while(true) {
		var res = gen.next()
		if(res.done) return res.value
	}
}

J.printStack = function(S) {
	return S.map(function(frame) {
		return frame.loc.toString() + ' { ' + Object.keys(frame.env).map(function(key) {
			return key + ' = ' + frame.env[key]
		}).join(', ') + ' }'
	}).join('\n')
}

J._G = (function() {
	var _G = this
	this.set('_G', this)

	this.set('print', J.function(this, [], function*(E, S, A) {
		console.log.apply(console, A)
	}))
	return this
}).call(J.tbl())