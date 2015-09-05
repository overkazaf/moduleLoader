/**
 * 	CommonJS Based Module Loader
 */
function require(name){

	if(name in require.cache){
		console.log('hit in cache');
		return require.cache[name]
	}

	var code = new Function('exports, module', readFile(name));
	var exports = {};
	var module = {exports:exports};
	code(exports, module);

	require.cache[name] = module.exports;
	return module.exports;
}

require.cache = Object.create(null);

function readFile(fileName){
	console.log(fileName);
}