/**
 *	Description: A tiny javascript module loader
 *  Author : overkazaf
 *  Email  : overkazaf@gmail.com
 *  Date   : 2015/7/2
 *  Original Created By : Weiwei SUN
 *  Modified By : overkazaf
 */
var defineCache = Object.create(null);
var currentMod = null;

function define (depNames, moduleFunction) {
	var thisMod = currentMod;
	var deps = depNames.map(getModule);
	deps.forEach(function(mod){
		if(!mod.loaded){
			//如果当前模块没有加载完成，为其增加onload事件
			mod.onLoad.push(depsLoaded);
		}
	});

	function depsLoaded(){
		if (!deps.every(function(m){
			// 如果其中一个没加载完成, 往下走
			return m.loaded;
		})) {
			// 如果依赖加载完成，直接返回
			return;
		}

		var args = deps.map(function(m){
			// 把各个导出模块作为参数，加入到回调中执行
			return m.exports;
		});

		var exports = moduleFunction.apply(null, args);
		if(thisMod){
			//更新当前加载完成的模块
			thisMod.exports = exports; // 对外暴露的模块接口
			thisMod.loaded = true;
			thisMod.onLoad.forEach(function(f){
				f();
			});
		}
	}

	depsLoaded();
};


function getModule(name) {
	if (name in defineCache) {
		return defineCache[name];
	}

	var module = {
		'exports' : null, // 对外暴露的接口
		'loaded' : false, // 是否加载完成
		'onLoad' : [] // 加载后的事件处理队列
	};

	defineCache[name] = module;

	asyncReadFile(name, function (codes){
		currentMod = module;
		new Function('', codes)();
	});

	return module;
};

function asyncReadFile(url, callback){
	var xhr = new XMLHttpRequest(); // 必须要开多个xhr，不然后者会中止前边任务的执行
	xhr.open('GET', url, true);
	xhr.addEventListener('load', function (){
		if (xhr.status == 200) {
			callback(xhr.responseText);
		}
	});
	xhr.send(null);
};
