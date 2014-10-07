var J = require('jua-runtime')
var main = J.F(J._G, [], function*(E, S, A) {
	J.L(E, 'foo', 'fiz'); J.L(E, 'bar', 'buz');
	J.L(E, 'fiz', E.foo); J.L(E, 'buz', E.bar);
	yield* J.G(E, S, 'print')(S, 1, 2, 3)
})
J.runSync(main([]))