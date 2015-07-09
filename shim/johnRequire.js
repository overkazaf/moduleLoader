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


(function ( global ){
	var moduleCache = {},
		shim = {},
		defineConfig = {},
		moduleAlias = {},
		deptCounts = 0,
		loadQueue = [], // 全局模块队列
		baseUrl = '',
		urlSubfix = '.js',
		currentModule = null,
		objproto = Object.prototype,
		protostr = objproto.toString,
		hasOwn = objproto.hasOwnProperty,
		arrproto = Array.prototype,
		nativeForEach = arrproto.forEach,
		nativeMap = arrproto.map,
		nativeEvery = arrproto.every,
		nativeSlice = arrproto.slice;


	//defineConfig['shim'] = {};

	function isFunction (it) {
		return protostr.call(it) === ['object Function'];
	}

	function isArray (it) {
		return protostr.call(it) === ['object Array'];
	}

	function getAbsUrl (url) {
		return baseUrl + (moduleAlias[url] || url) + urlSubfix;
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
			if (id in moduleAlias) {
				// 非AMD规范的模块， 用shim机制加载
				if(!shim[id])shim[id] = {};

				shim[id]['exports'] = new Function('', codes);
				//log(id, codes);
				
				var fnRebind = shim[id]['exports'].bind(shim[id]['exports']);
				fnRebind();
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
		url = getAbsUrl(url);
		xhr.open('get', url, true);
		xhr.addEventListener ('load', function(){
			if (xhr.status == 200) {
				callback(xhr.responseText);
			}
		});
		xhr.send(null);
	}

	define.config = function (json) {
		defineConfig = mixin(defineConfig, json, true, true);
		moduleAlias = mixin({}, defineConfig['alias'], true);
		baseUrl = defineConfig['baseUrl'];

		//defineConfig = json || {'shim' : {}};
	}


	function eachProp (obj, callback) {
		var prop;
		for (prop in obj) {
			if (hasProp(obj, prop)) {
				if (callback(obj[prop], prop)) break;
			}
		}
	}

	function hasProp (obj, prop) {
		return hasOwn.call(obj, prop);
	}

	/**
	 * [mixin 杂揉函数]
	 * @param  {[Object]} target          [目标对象]
	 * @param  {[Object]} source          [源对象]
	 * @param  {[Boolean]} force           [是否覆盖目标对象属性]
	 * @param  {[Boolean]} deepStringMixin [是否深拷贝]
	 * @return {[Object]}                 [糅合后的对象]
	 */
	function mixin(target, source, force, deepStringMixin) {
        if (source) {
            eachProp(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin 
                    	&& typeof value === 'object' 
                    	&& value 
                    	&& !isArray(value) 
                    	&& !isFunction(value) 
                    	&& !(value instanceof RegExp)) {
	                        if (!target[prop]) {
	                            target[prop] = {};
	                        }

	                        // recursive calling
                        	mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }

            });
        }
        return target;
    }

	/**
	 * [define 以amd规范定义一个js模块]
	 * @param  {[Array]} deptNames   [依赖列表]
	 * @param  {[Function]} factory [回调入口]
	 * @return {[type]}         [description]
	 */
	function define (deptNames, factory) {
		// 获取各个模块
		var deps = [];
		deptCounts = deptNames.length;
		for (var i=0,l=deptNames.length; i<l; i++) {
			var d = deptNames[i];
			if (d in defineConfig['shim']) {
				// 不合规范的直接放入队列，预先加载
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
					// ensure every module execute correctly
					setTimeout(f, 4);
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
				if ( callback.call(context, ary[i], i, ary) ) {
					break;
				}
			}
		}
	}

	function map (ary, callback, context) {
		if (nativeMap && ary.map === nativeMap) {
			nativeMap.call(ary, callback);
		} else if (ary.length){
			var result = [];
			for (var i = 0, l = ary.length; i < l; i++) {
				result.push(callback.call(context, ary[i], i, ary));
			}
			return result;
		}
	}

	function every (ary, callback, context) {
		if (nativeEvery && ary.every === nativeEvery) {
			nativeEvery.call(ary, callback);
		} else if (ary.length){
			for (var i = 0, l = ary.length; i < l; i++) {
				if (!callback.call(context, ary[i], i, ary)) return false;
			}
			return true;
		}
	}

	Function.prototype.bind = function (){
		var fn = this,
			args = nativeSlice.call(arguments),
			obj = args.shift();
		return function (){
			return fn.apply(obj, args.concat(nativeSlice.call(arguments)));
		}
	};

	global.define = define;
	global.shim = shim;
})(window);