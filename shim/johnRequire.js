/**
 * [A javascript module loader, support shim, based on AMD]
 *
 * Author : overkazaf
 * Email  : overkazaf@gmail.com
 * QQ     : 289202839
 * Originates From : Weiwei Sun
 * Modified By : John Nong(overkazaf)
 * Date   : 2015/7/4
 */


var moduleCache = {},
	shim = {},
	defineConfig = {},
	currentModule = null,
	objproto = Object.prototype,
	protostr = objproto.toString,
	arrproto = Array.prototype,
	nativeForEach = arrproto.forEach;


defineConfig['shim'] = {};

function isFunction (it) {
	return protostr.call(it) === ['object Function'];
}

function isArray (it) {
	return protostr.call(it) === ['object Array'];
}

function getModule (id) {
	if (id in moduleCache) {
		return moduleCache[id];
	}

	var module = {
		id      : id,
		exports : null,
		loaded  : false,
		onLoad  : []
	};


	moduleCache[id] = module;

	readFileAsync (id, function (codes){
		currentModule = module;
		if (id in defineConfig['shim']) {
			// 非AMD规范的模块， 用shim机制加载
			module.loaded = true;
			shim[id] = new Function('', codes);
			//log(id, codes);
			shim[id].call(shim);
		} else {
			// 规范的AMD模块， 直接注入并交给引用
			new Function('', codes)();
		}
	});

	return module;
}

/**
 * [readFileAsync 异步读取js文件]
 * @return {[type]} [description]
 */
function readFileAsync (url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('get', url, true);
	xhr.addEventListener ('load', function(){
		if (xhr.status == 200) {
			callback(xhr.responseText);
		}
	});
	xhr.send(null);
}

define.config = function (json) {
	defineConfig = json || {'shim' : {}};
}

/**
 * [define 定义一个js模块]
 * @param  {[Array]} deptNames   [依赖列表]
 * @param  {[Function]} factory [回调入口]
 * @return {[type]}         [description]
 */
function define (deptNames, factory) {
	// 获取各个模块
	var deps = [];
	for (var i=0,l=deptNames.length; i<l; i++) {
		var d = deptNames[i];
		if (d in defineConfig['shim']) {
			getModule(d);
		} else {
			deps.push(getModule(d));
		}
	}
	var thisMod = currentModule;

	forEach(deps, function (m){
		if (!m.loaded) {
			m.onLoad.push(moduleLoadedEvent);
		}
	});
	function moduleLoadedEvent () {
		if (!deps.every(function(m){
			return m.loaded;
		})) {
			return;
		}

		var args = deps.map(function (mod){
			return mod.exports;
		});


		var exports = factory.apply(null, args);

		if (thisMod) {
			thisMod.exports = exports;
			thisMod.loaded = true;
			forEach(thisMod.onLoad, function (f) {
				f();
			});
		}
	}

	moduleLoadedEvent();
}

function forEach (ary, callback, context) {
	if (nativeForEach && ary.forEach === nativeForEach) {
		nativeForEach.call(ary, callback);
	} else if (ary.length){
		for (var i = 0, l = ary.length; i < l; i++) {
			callback.call(context, ary[i], i, ary);
		}
	}
}