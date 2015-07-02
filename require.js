/**
 *  An AMD based javascript module loader
 *  Author : overkazaf
 *  Email  : overkazaf@gmail.com
 *  Date   : 2015/7/2
 *  
 */
var moduleCache = {};
var currentModule = null;


// utils
var objproto = Object.prototype,
	protostring = objproto.toString,
	arrproto = Array.prototype,
	nativeforEach = arrproto.forEach;

function isFunction (it) {
	return protostring.call(it) === '[object Function]';
}

function isArray (it) {
	return protostring.call(it) === '[object Array]';
}


function define (depNames, moduleFunc) {
	var thisMod = currentModule;
	var deps = depNames.map(getModule);

	deps.forEach(function(m){
		if (!m.loaded){
			m.onLoad.push(loadedEventListener);
		}
	});

	function loadedEventListener () {
		if (!deps.every(function(m){
			return m.loaded;
		})) {
			return;
		}

		var args = deps.map(function(mod){
			return mod.exports;
		});

		var exports = moduleFunc.apply(null, args);

		if (thisMod) {
			thisMod.exports = exports;
			thisMod.loaded = true;
			thisMod.onLoad.forEach(function (f){
				f();
			});
		}

	}

	loadedEventListener();
}

/**
 * [getModule Get a specific module that expose some interfaces to a callback]
 * @param  {[String]} moduleName [a javascript filename]
 * @return {[Object]}            [module]
 */
function getModule (moduleName) {
	if (moduleName in moduleCache) {
		return moduleCache;
	}

	var module = {
		exports : null, 
		loaded : false,
		onLoad : []
	};

	moduleCache[moduleName] = module;

	readFileAsync(moduleName, function (code){
		currentModule = module;
		new Function('', code)();
	});

	return module;
}


/**
 * [readFileAsync create new xhr instance to get a js file asynchronizlly]
 * @param  {[type]}   url      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function readFileAsync (url, callback){
	var xhr = getXMLHttpRequest();
	xhr.open('get', url, true);
	addEvent(xhr, 'load', function (){
		if (xhr.status == 200) {
			isFunction(callback) && callback(xhr.responseText);
		}
	});
	xhr.send(null);
}


function getXMLHttpRequest () {
	if (window.XMLHttpRequest) {
		return new XMLHttpRequest();
	} else {
		var MSXML = ['MSXML2.XMLHTTP.5.0', 'MSXML2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0', 'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
        //依次对每个XMLHttp创建XMLHttpRequest对象
        for(var i = 0; i < MSXML.length; i++){
            try{
                //微软发布的是ActiveX控件
                return new ActiveXObject(MSXML[i]);
            }catch(e){
                throw e;
            }
        }
	}
}


function addEvent (obj, type, fn) {
	if (obj.addEventListener){
		obj.addEventListener(type, fn);
	} else if (window.attachEvent){
		obj.attachEvent('on' + type, fn, false);
	} else {
		obj['on' + type] = fn;
	}
}


// forEach, map, every
function forEach (ary, callback, context) {
	if (ary == null) return;

	if (nativeforEach && ary.forEach === nativeforEach) {
		ary.forEach(callback, context);
	} else if (ary.length === +ary.length) {
		for (var i = 0, l = ary.length; i < l; i++) {
			callback.call(context, ary[i], i, ary);
		}
	}
}