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

	function getAbsoluteUrl (url) {
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
		url = getAbsoluteUrl(url);
		xhr.open('get', url, true);

		// ie8 下要用这样的方式监听xhr对象的状态，否则报错
		addEvent(xhr, 'readystatechange', function(){
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					callback(xhr.responseText);
				}
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

	/**
	 * [eachProp 属性遍历]
	 * @param  {[Object]}   obj      [description]
	 * @param  {Function} callback [回调]
	 * @return {[void]}            [description]
	 */
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

		deps.forEach(function (m){
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
				thisMod.onLoad.forEach(function (f) {
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

	/**
	 * [makeFnSupports 添加一些ES5的方法，方便操作]
	 * @return {[type]} [description]
	 */
	function makeFnSupports () {
		if (typeof Array.prototype.map !== 'Function') {
			Array.prototype.map = function (callback){
				var result = [],
					ary = this;
				if (ary.length) {
					for (var i = 0, l = ary.length; i < l; i++) {
						result.push(callback.call(this, ary[i], i, ary));
					}
				}
				return result;
			}
		}

		if (typeof Array.prototype.every !== 'Function') {
			Array.prototype.every = function (callback){
				var result = [],
					ary = this;
				if (ary.length) {
					for (var i = 0, l = ary.length; i < l; i++) {
						if (!callback.call(this, ary[i], i, ary)) {
							return false;
						}
					}
				}
				return true;
			}
		}

		if (typeof Array.prototype.forEach !== 'Function') {
			Array.prototype.forEach = function (callback){
				var result = [],
					ary = this;
				if (ary.length) {
					for (var i = 0, l = ary.length; i < l; i++) {
						callback.call(this, ary[i], i, ary);
					}
				}
			}
		}

		if (typeof Function.prototype.bind !== 'Function') {
			Function.prototype.bind = function (){
				var fn = this,
					args = nativeSlice.call(arguments),
					obj = args.shift();
				return function (){
					return fn.apply(obj, args.concat(nativeSlice.call(arguments)));
				}
			};
		}
	};

	/**
	 * [addEvent 事件控制]
	 * @param {[type]}   obj  [description]
	 * @param {[type]}   type [description]
	 * @param {Function} fn   [description]
	 */
	function addEvent (obj, type, fn) {
		if (window.addEventListener) {
			obj.addEventListener(type, fn);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + type, fn, false);
		} else {
			obj['on' + type] = fn;
		}
	}

	// 开始为不支持ES5的浏览器注入一些工具方法
	makeFnSupports();

	global.define = define;
	global.shim = shim;
})(window);