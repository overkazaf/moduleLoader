define([], function(){
	return {
		CALL : function (msg){
			log('Message from module B:' + msg);
		}
	}
});