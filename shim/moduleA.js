// 测试非AMD规范的模块
!function(window){
	
	function jQuery () {};
	var $ = jQuery;
	
	jQuery.ALERT = function (msg){
		alert('Message from fake jQuery:' + msg);
	}

	window.$ = $;
}(window);