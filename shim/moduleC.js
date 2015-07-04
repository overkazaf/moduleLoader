!function(root){
	function LLL(msg){
		alert('Message from shim:' + msg);
	};
	root.LLL = LLL;
}(window);