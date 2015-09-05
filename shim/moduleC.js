define(['jquery', 'hashchange', 'easytabs', 'moduleB'], function (moduleB){
	return {
		init : function (){
			// 这里由于jquery, hashchange, easytabs都是非AMD规范的模块，
			// 为了保证其加载顺序，要引入一个中间模块B去缓冲加载
			moduleB.init();
		}
	};
});