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

/**
 * Creates a locked region with some custom attributes for a given piece of content
 */
function replaceToken( className, original, translatedCode, additionalAttributes ) {
	var replCode = '<MM:BeginLock translatorClass="' + className + '"';
	
	// add aditional custom attributes//
	if ( additionalAttributes ) {
		for ( var attribute in additionalAttributes ) {
			replCode += ' ' + attribute + '="' + additionalAttributes[ attribute ] + '"';
		}
	}
	
	replCode += ' orig="' + escape( original ) + '">';
	replCode += translatedCode;
	replCode += '<MM:EndLock>';

	return replCode;
};

/**
 * Detects the type of the given piece of content
 */
function getAttributeForTranslatedContent( original ) {
	if ( original.match( /\{module_/gi ) ) {
		return "BC.Token.Module";
	} else {
		if ( original.match( /\{\s*%\s*include/gi ) ) {
			return "BC.Token.Include";
		} else {
			return "BC.Token.Tag";
		}
	}
};

/**
 * Scans a string for text portions and calls a replace function on each text
 */
function scanStringText(str, replaceFunction, shouldTranslateFunction) {
	var outStr = str;
	var delta = 0;

	var callback = {
		text: function(text, offset) {
			if ( !text || !text.length ) {
				return;
			}
			
			if (!shouldTranslateFunction(text)) {
				return;
			}
		
			var initialLength = outStr.length;
			outStr = outStr.substring( 0, offset + delta ) +  replaceFunction(text) + outStr.substr( offset + delta + text.length );
			delta += outStr.length - initialLength;
		}
	};

	dw.scanSourceString(str, callback , false /*skip whitespace false*/);
	return outStr;
} 


/**
 * Runs a replace function multiple times on a text, using scan string function
 */
function replacerBase( text, replaceFunction, replaceConditionFunction) {
	if ( !text ) {
		return '';
	}

	var translatedText = text;
	var completed = false;
	var counter = 0;
	
	// Maybe we have modules in modules, or external sources in extenal sources, so we're trying to
	// replace until we get no more changes, or up to 10 levels (to avoid infinite loops)
	while ( !completed && ( 10 > counter ) ) {
		counter++;
		var prev = translatedText;
		
		translatedText = scanStringText(translatedText, replaceFunction, replaceConditionFunction);
		
		completed = (prev == translatedText);
	}

	return translatedText;
}

/**
 * Runs a replace function on a body section of a html, or on all text if no body found 
 */
function replaceTextInBody(inStr, replaceFunction){
	var indexOfBodyStart = inStr.search(/<\s*body[^>]*>/gi);
	var indexOfBodyEnd = inStr.search(/<\s*\/body\s*>/gi);
	var bodyStartMatch = inStr.match(/<\s*body[^>]*>/i);
	
	var stringToTranslate = inStr;
	
	if (indexOfBodyStart != -1 && indexOfBodyEnd != -1) {
		stringToTranslate = stringToTranslate.substring(indexOfBodyStart + bodyStartMatch[0].length, indexOfBodyEnd);
	}
	
	stringToTranslate = replaceFunction(stringToTranslate);
	
	var outStr = stringToTranslate;
	
	if (indexOfBodyStart != -1 && indexOfBodyEnd != -1) {
		outStr = inStr.substring(0, indexOfBodyStart  + bodyStartMatch[0].length) + stringToTranslate + inStr.substr(indexOfBodyEnd);
	}
	
	return outStr;
}