/**
 *	Description: A tiny javascript modules loader
 *  Author : overkazaf
 *  Email  : overkazaf@gmail.com
 *  Github : https://github.com/overkazaf
 *  Date   : 2015/7/1
 *  Original Created By : Weiwei SUN
 *  Modified By : overkazaf
 */

var moduleCache = {};
var currentModule = null;
var alias = {
	sub : 'modules/subfolder.js'
};
var objproto = Object.prototype,
	arrproto = Array.prototype,
	objtostring = objproto.toString;

function isFunction(it){
	objtostring.call(it) === '[object Function]';
}

function isArray(it){
	objtostring.call(it) === '[object Array]';
}

/* 加入map, every, forEach方法来支持低级浏览器 */

function define (depNames, moduleFunc){
	var thisMod = currentModule;
	var deps = depNames.map(getModule);

	deps.forEach(function (m){
		if (!m.loaded) {
			m.onLoad.push(loadedEventListener);
		}
	});

	function loadedEventListener(){
		if (!deps.every(function(m){
			return m.loaded;
		})){
			return;
		}

		var args = deps.map(function(mod){
			return mod.exports;
		});

		var exports = moduleFunc.apply(null, args);
		if (thisMod) {
			thisMod.exports = exports;
			thisMod.loaded = true;
			thisMod.onLoad.forEach(function(f){
				f();
			});
		}
	}

	loadedEventListener();
}

function moduleAlias (shortName) {
	// 从config 对象的path属性中构建根目录到当前名字的完整路径
	// 格式: path/to/file/shortName.js
	return null;
}

function readFile (url, callback){
	var xhr = getXMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.addEventListener ('load', function (){
		if (xhr.status == 200) {
			callback(xhr.responseText);
		}
	});
	xhr.send(null);
	log('sending ajax :' + url);
}


/**
 * [getModule get a module base on a module name]
 * @param  {[String]} moduleName [description]
 * @return {[Object]}            [description]
 */
function getModule (moduleName) {
	moduleName = moduleAlias(moduleName) || moduleName;
	if (moduleName in moduleCache) {
		log(moduleName + ': hit in cache');
		return moduleCache[moduleName];
	}

	var module = {
		exports : null,
		loaded : false,
		onLoad : []
	};

	moduleCache[moduleName] = module;

	readFile(moduleName, function (code){
		currentModule = module;
		new Function('', code)();
	})

	return module;
}

function getXMLHttpRequest(){ 
	return new XMLHttpRequest(); 
} 