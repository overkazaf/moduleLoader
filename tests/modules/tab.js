var alias = {
  'jquery' : '../vendor/jquery-1.7.2.js',
  'hashchange' : '../vendor/jquery.hashchange.min.js',
  'easytabs' : '../vendor/jquery.easytabs.js'
};
var dept = [];
for (var id in alias) {
  dept.push(alias[id]);
}

define(dept, function ($, easytabs){
   alert('inside tab.js');
   return {
    init : function (){
      $('.tab-container').easytabs();
    }
   };
});