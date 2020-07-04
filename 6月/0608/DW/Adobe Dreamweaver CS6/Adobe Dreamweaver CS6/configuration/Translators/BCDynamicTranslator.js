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

var className = "BUSINESS_CATALYST_DYNAMIC";
var docUrl, siteRoot;

function getTranslatorInfo() {
	return [
		className,                  
		"BUSINESS_CATALYST_DYNAMIC",              
		"0",                    
		"1",                     
		"\\{(?:module_|(\\s*\\%\\s*include)|(\\s*\\%\\s*comment))",      
		"byExpression",            
		"1"                       
	];
}

/**
 * Translate markup phase
 */
function translateMarkup(docNameStr, siteRootStr, inStr){
	if (!MM.BC.SITE.getSiteID(null, docNameStr)) return inStr;

	//If the document does not contain any content, terminate the translation.
	if ( inStr.length <= 0 ){
		return inStr;
	}

	docUrl = docNameStr;
	siteRoot = siteRootStr;
	
	var outStr;
	
	try {
		
		outStr = replaceTextInBody(inStr, function(stringToTranslate) {
			var replacedText = translateCommentsMarkup(stringToTranslate)
			replacedText = replaceModulesAndIncludes(replacedText);
			return replacedText;
		});
		
		MM.BC.translatorRun = true;		
	} catch(e) {
		return inStr;
	}
		
	return outStr;
};



/**
 * Replaces the modules and includes with their translated code
 */
function replaceModulesAndIncludes( text) {
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
		
		translatedText = replaceDynamicTokens( translatedText, true );

		completed = ( prev == translatedText );
	}

	translatedText =  translatedText.replace(/MM:BC:MODULESTART/gi, "{");
	translatedText =  translatedText.replace(/MM:BC:MODULEEND/gi, "}");

	return translatedText;
};

/**
 * Replaces the comments markup with a translated code
 */
function translateCommentsMarkup(inStr) {
	var outStr = inStr;
	
	function commentLiquidLocked(str) {
		
		var startLock = '<MM:BeginLock translatorClass="BUSINESS_CATALYST_COMMENT" ';
		startLock += ' depFiles=""';
		startLock += ' orig="' + escape( str ) + '">' + "" + '<MM:EndLock>';
		return startLock;
	}
	
	
	outStr = outStr.replace(/\{%\s*comment\s*-?\s*%\}([\w\W]*?)\{%\s*endcomment\s*-?\s*%\}/gi, commentLiquidLocked);
	
	return outStr;
}

function liquidLocked(str) {
	var startLock = '<MM:BeginLock translatorClass="BUSINESS_CATALYST_LOCK" ';
	startLock += ' depFiles=""';
	startLock += ' orig="' + escape( str ) + '">' + str + '<MM:EndLock>';
	return startLock;
}

function trimModuleToken(token) {
	var match = token.match(/\{\s*module_\w*/i);
	var simpleToken = "{}";
	if (match) {
		simpleToken = match[0] + "}"
	}
	return simpleToken.substring(1, simpleToken.length - 1);
}

function getModuleID(token) {
	var moduleName = token.match( /(module_\w*)/i)[1];
	return moduleName;
}

function getModuleName(token) {
	var moduleID = getModuleID(token);
	var module = MM.BC.MODULES.getModuleByName(moduleID);
	var moduleName = "";

	if (module) {
		moduleName = module.label;
	} else {
		moduleName = token.match( /module_(\w*)/i)[1]
	}
	
	return moduleName;
}
/**
 * Translate the modules and includes with the contents of the module template/include file
 */
function replaceDynamicTokens( text, shouldHighlight ) {
	
	var allModules = MM.BC.UTILS.findAllModules(text);
	
	var includesTokens = text.match( MM.BUSINESS_CATALYST_REGEXP["include_global"] );
	
	var tokens = [];
	if (allModules) {
		for ( var tokenIndex = 0; tokenIndex < allModules.length; tokenIndex++ ) {
			tokens.push(allModules[ tokenIndex ].token);
		}
		}
	
	if (includesTokens) {
		tokens = tokens.concat(includesTokens);
	}

	var isInclude = false;
	var translatedCode;
	
	var original = text;
	var offset = 0;
	
	for ( var tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++ ) {
		var tokenCode = tokens[ tokenIndex ];
		
		isInclude = !tokenCode.match(/\{\s*module_/i);
		
		var depFiles = [];
		
		try {
			depFiles = MM.BC.MODULES.getDepFilesForToken( tokenCode, siteRoot, docUrl );
		} catch (e) {
			
		}
		
		//MM.BC.log('depFiles##' + MM.BC.JSON.stringify(depFiles));
		
		var translatedCode = "";
		var fileNotFoundMsg = dw.loadString('bc/translator/fileNotFound');
		
		// if no dept files, try getting static content//
		if ( !depFiles || !depFiles.length) {
			translatedCode = MM.BC.MODULES.getModuleContentFromServer(tokenCode, docUrl);
			if ( !translatedCode || !translatedCode.length ) {
				// the external file doesn't exist, show message instead//
				if (isInclude) {
					translatedCode = fileNotFoundMsg;
				} else {
					translatedCode = "MM:BC:MODULESTART" + trimModuleToken(tokenCode) + "MM:BC:MODULEEND";
				}
			}
		} else {
			if (depFiles[ 0 ].path != docUrl) {
			translatedCode = MM.BC.UTILS.getExtenalFileContent( depFiles[ 0 ].path, "MM:BC:MODULESTART" + trimModuleToken(tokenCode) + "MM:BC:MODULEEND");
			} else {
				if (isInclude) {	
					translatedCode = fileNotFoundMsg;
				} else {
				translatedCode = "MM:BC:MODULESTART" + trimModuleToken(tokenCode) + "MM:BC:MODULEEND";

				}
			}
		}
		
		//MM.BC.log('translatedCode2##' + translatedCode);
		
		if ( shouldHighlight) {
			
			var moduleName = "";
			var title = "";
			
			// if there is a dependent file//
			if (!isInclude) {
				moduleName = getModuleName(tokenCode);
			}

			var includeOutlineMsg = dw.loadString("bc/translator/includeOutlineText");
			var moduleOutlineMsg = dw.loadString("bc/translator/moduleOutlineText");
			
			var includeString = "";
			var moduleString = moduleOutlineMsg.replace('%1', function (str) {
				return moduleName;
			});
			
			if (depFiles && depFiles.length) {
				var filePath = depFiles[0].path.replace(dw.getSiteRoot(), '/');
				includeString = includeOutlineMsg.replace('%1', function (str) { 
					return filePath;
				});
			}

			title = (isInclude ? includeString : moduleString);
			translatedCode = highlightTranslatedCode(title, translatedCode, isInclude );
		}
		
		var absolutePaths = new Array();
		for ( var i = 0; i < depFiles.length; i++ ) {
			if (DWfile.exists(depFiles[i].path) && depFiles[i].path != docUrl) {
				absolutePaths.push( depFiles[i].path );
			}
		}

		// define custom attrs that will be added to translated code//
		var customAttrs = {};
		customAttrs.depFiles = absolutePaths.join( "," );
		customAttrs[ getAttributeForTranslatedContent( tokenCode ) ] = true;
		
		var replacement = replaceToken( className, tokenCode, translatedCode, customAttrs );
		
		var offset = text.length - original.length;
		var hasOffsets = false;
		
		if (allModules.length > tokenIndex) {
			var moduleData = allModules[ tokenIndex ];
			if (moduleData && moduleData.start && moduleData.end) {
				hasOffsets = true;
				text = text.substring(0, moduleData.start + offset) + replacement + text.substr(moduleData.end + offset + 1);
			}
		} 
		
		if (!hasOffsets){
			text = text.replace(tokenCode, function (str) {
				return replacement;
			});
	}

	}

	return text;
};

/**
 * Add an outline to the translated area
 */
function highlightTranslatedCode( title, code, gray ) {
		return "<MM:DECORATION"
		+ ' outline="' + title + '"'
		+ ' outlineId="unique"'
		+ (!gray ? ' outlineForSelection="outlineForSelection"' : '')
		+ (!gray ? ' hiliteChildrenOnSelect="true"' : '') + '>'
		+ code
	 	+ "</MM:DECORATION>";
};
