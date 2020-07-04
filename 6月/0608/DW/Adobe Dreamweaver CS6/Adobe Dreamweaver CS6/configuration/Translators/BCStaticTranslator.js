/*************************************************************************
 *
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2011 Adobe Systems Incorporated
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 **************************************************************************/

var className = "BUSINESS_CATALYST_STATIC";

/**
 * Translator info.
 *
 */
function getTranslatorInfo() {
	return [
		className, 								
		"BC Static Tokens",         
		"0",                   
		"1",                        
		"((\{\{)|(\{%))",     
		"byExpression",          
		"100"                         
	];
}

/**
 * Translator markup phase.
 *
 */
function translateMarkup(docNameStr, siteRootStr, inStr){
	if (!MM.BC.SITE.getSiteID(null, docNameStr)) return inStr;
	
	if ( inStr.length <= 0 ){
		return "";
	}

	var outStr = replaceTextInBody(inStr, function(stringToTranslate) {
		var replacedText = scanStringText(stringToTranslate, replacer, shouldTranslate);
		return replacedText;
	});

	return outStr;
};

/**
 * Replaces the tags and variables with their translated code
 */
function replacer( text) {
	return replacerBase(text, function(text) {
		var str = translateDynamicImages(text);
		str = translateSectionsMarkup(str);
		str = translateGenericPairsMarkup(str);
		str = translateGenericMarkup(str);
		return str;
	}, shouldTranslate);
};

/**
 * Determines if a piece of text should be translated
 */
function shouldTranslate(text) {
	if (text.indexOf('{{') == -1 && text.indexOf('{%') == -1) {
		return false;
	}
	return true;
}

/**
 * Translate images that have liquid markup in the src attribute with the dynamic image icon
 *
 */
function translateDynamicImages(inStr) {
	var outStr = inStr.replace(/src=(['"])[^'"]*\{\{[^'"]*\}\}[^'"]*['"]/gi, '$& mmTranslatedValueDynSRC="SRC=dwres:6088" mmTranslatedValueDynAttrs="DynAttrs=src"');
	
	return outStr;
}

/**
 * Translate all generic liquid markup (liquid markup that is not translated in any other way) with a BC liquid icon
 *
 */
function translateGenericMarkup(inStr) {
	var outStr = inStr;
	
	function genericLiquidLocked(str, p1, offset, s) {
		var startLock = '<MM:BeginLock translatorClass="BUSINESS_CATALYST_OTHER" ';
		startLock += ' depFiles=""';
		startLock += ' orig="' + escape( str ) + '">' + "" + '<MM:EndLock>';
		return startLock;
	}

	outStr = outStr.replace(/\{%([\w\W]*?)%\}/gi, genericLiquidLocked);
	
	return outStr;
}

/**
 * Translate all generic liquid markup that is in a paired form {%capture%} {%endcapture%} (liquid markup that is not translated in any other way) with a BC liquid icon
 *
 */
function translateGenericPairsMarkup(inStr) {
	var outStr = inStr;
	
	function genericLiquidLocked(str, p1, offset, s) {
		var match = str.match(/\{%\s*([\w\W]*?)\s*-?\s*%\}([\w\W]*?)\{%\s*end\1\s*-?\s*%\}/i);
		var content = "";
		if (match && match[2]){ 
			content = match[2];
		}
		var startLock = '<MM:BeginLock translatorClass="BUSINESS_CATALYST_OTHER" ';
		startLock += ' depFiles=""';
		startLock += ' orig="' + escape( str ) + '">' + content + '<MM:EndLock>';
		return startLock;
	}
	
	outStr = outStr.replace(/\{%\s*([\w]*?)\s*-?\s*%\}([\w\W]*?)\{%\s*end\1\s*-?\s*%\}/gi, genericLiquidLocked);

	return outStr;
}


function translateSectionsMarkup(inStr) {
	var outStr = inStr;
	
	function genericLiquidLocked(str, p1, offset, s) {
		var startLock = '<MM:BeginLock translatorClass="BUSINESS_CATALYST_SECTION" ';
		startLock += ' depFiles=""';
		startLock += ' orig="' + escape( str ) + '">' + "" + '<MM:EndLock>';
		return startLock;
	}

	outStr = outStr.replace(/\{%\s*section\s*-?\s*%\}([\w\W]*?)\{%\s*endsection\s*-?\s*%\}/gi, genericLiquidLocked);
	
	return outStr;
}
