/***************************************************************************************************************************************
	Delete/SourceCode
	Edit/Add -> constructConfigPanel 
					-> EditableWidget
									  panelStrategies[async]	-> readCache
					-> AddiableWidget
											-> renderPanel 					
												-> panelReadyFn 
																	 			     -> extraFn
												-> panelAddiableReadyFn		-> fnOK  -> ftlTransformer   -> ftlStrategies  -> HTMLUnescape
																				     -> updateDOM        -> bindEvents/delegateEvents
																				     -> writeAttr
																				
																			-> fnCancel  -> GC




			 -> extraFn
	-> fnOK  -> ftlTransformer   -> ftlStrategies  -> HTMLUnescape
	         -> updateDOM        -> bindEvents/delegateEvents
	         -> writeAttr
***************************************************************************************************************************************/

function ftlTransformer (json){
	var html = ftlStrategies[json['type']](json);
	return HTMLUnescape(html);
}

/* 构建FreeMarker模板 */
/* 样式类字典 */
var classDict = {
	'panel' : {
		'underlineType' : {
			'type1' : 'dashed',
			'type2' : 'solid',
			'type3' : 'dotted',
			'type4' : 'typ4Class'
		},
		'listStyleType' : {
			'type1' : 'trangle',
			'type2' : 'circle',
			'type3' : 'square',
			'type4' : 'typ4Class'
		}
	}
};

/* 默认ftl参数值，预防空参数错误 */
var ftlDefaults = {
	'panel' :  {
		'siteName' : 'Nil', // 站点名称
		'siteColumn' : 'Nil', // 栏目名称
		'count' : 1, // 新闻条数
		'length' : 15 // 链接文字长度
	}
};

/**
 * [ftlStrategies FreeMarker 的标签生成策略]
 * @type {String} 返回标签html，未进行HTML字符转义
 *
 * json = {
 * 	type : 'panel',
 * 	siteName : 'ntdx',
 * 	siteColumn : 'zxdt',
 * 	titleIconType : 'flag',
 * 	dateType : 'date',
 * 	listStyleType : 'triangle',
 * 	underlineType : 'dashed'
 * 
 * };
 */

var ftlStrategies = {
	'panel' : function (json){
		json = $.extend({}, ftlDefaults[json['type']], json || {});
		var dict = classDict[json['type']];
		var html = '';
			html += '<@cmslist lmxx="'+ json['siteName'] +','+ json['siteColumn'] +'" count="'+ json['count'] +'" order="">';
			html += '<#list messageMap as nr>';
			html += '<li class='+ dict[json['underlineType']] +'>';
			html += '<span class='+ dict[json['listStyleType']] +'></span>';
			html += '<span class='+ dict[json['dateType']] +'>${nr.msgAll.releaseTime?string("MM-dd")}</span>';
			html += '<a href=\"${nr.msgAll.htmlPath!""}\"';
			html += ' style="<#if nr.msgAll.isBold==1>font-weight:bold;</#if><#if nr.msgAll.titleColor??>color:${nr.msgAll.titleColor};</#if>"';
			html += ' title=\"${nr.msgAll.msgTitle!""}\">';
			html += '<#if nr.msgAll.msgTitle?length lt '+ json['length'] +'>';
			html += '${nr.msgAll.msgTitle}';
			html += '<#else>';
			html += '${(nr.msgAll.msgTitle)?substring(0,'+ json['length'] +')}..';
			html += '</#if>';
			html += '</a>';
			html += '</li>';
			html += '</#list>';
			html += '</@cmslist>';
		return html;
	}
};

function writeAttr ($obj, attr_name, attr_val){
	attr_val = attr_val || '';
	$obj.attr(attr_name, attr_val);
}

function writeCache($obj, json){
	writeAttr($obj, 'data-cache', JSON.stringify(json));
};