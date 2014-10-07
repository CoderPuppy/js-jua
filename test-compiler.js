var jua = require('./')
var ast = require('./test-ast')
var util = require('util')

exports.jsAST = jua.compiler(ast, { shortNames: true })
console.log(util.inspect(exports.jsAST, { colors: true, depth: null }))

exports.string = jua.compiler.stringify(exports.jsAST)
console.log(exports.string)