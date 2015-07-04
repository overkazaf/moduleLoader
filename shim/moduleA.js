!function(window){
	
	function jQuery () {};
	var $ = jQuery;
	
	jQuery.ALERT = function (msg){
		alert('Message from fake jQuery:' + msg);
	}

	window.$ = $;
}(window);