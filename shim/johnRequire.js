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
		deptCounts = 0,
		loadQueue = [], // 全局
		currentModule = null,
		objproto = Object.prototype,
		protostr = objproto.toString,
		arrproto = Array.prototype,
		nativeForEach = arrproto.forEach,
		nativeSlice = arrproto.slice;


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
		url = url && url.indexOf('.js') >= 0 ? url : url + '.js';
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