/*

 Copyright 2011 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 
*/

if (!MM.BC.MODULES) MM.BC.MODULES = {

	getModuleSeparator : function(token) {
		var matches = token.match(/(module_\w+([^\w\}]*))/i);
		
		// if not a module//
		if ( !matches || !matches.length ) {
			return '';
		}
		
		if (matches[2]) {
			return matches[2];
		}
		
		var moduleObj = MM.BC.MODULES.getModuleByName(matches[1]);
		
		var separatorTypes = [" ", ",", " "];
		
		// it has a dynamic path//
		if (moduleObj && moduleObj.parametersSeparatorType) {
			return separatorTypes[parseInt(moduleObj.parametersSeparatorType)];
		}
		
		return " ";
	},
	
	getModuleTemplateAttributeName : function(token) {
		var matches = token.match( /(module_\w+)/i );
		
		// if not a module//
		if ( !matches || !matches.length ) {
			return;
		}
		
		var moduleObj = MM.BC.MODULES.getModuleByName(matches[1]);
		
		if (!moduleObj || !moduleObj.translators) return;
		
		var translators = moduleObj.translators;
		
		
		translators.sort(MM.BC.UTILS.sortByPriority);
		for (var i = 0; i < translators.length; i++) {
			if (translators[i].dynamic) {
				var translatorValue = translators[i].dynamic;
				var isAttribute = translatorValue.match(/@@(\w*)@@/i);
				if (isAttribute) {
					return isAttribute[1];
				}
			}
		}
		return;
	},
	
	getAttributeFromToken: function( token, attribute ) {
		var attrs = {};
		if (MM.BC.MODULES_ATTTRIBUTES_CACHE && MM.BC.MODULES_ATTTRIBUTES_CACHE[token]) {
			attrs = MM.BC.MODULES_ATTTRIBUTES_CACHE[token];
		} else {
			attrs = MM.BC.MODULES.getAttributesFromToken(token);
			if (!MM.BC.MODULES_ATTTRIBUTES_CACHE) MM.BC.MODULES_ATTTRIBUTES_CACHE = {};
			MM.BC.MODULES_ATTTRIBUTES_CACHE[token] = attrs;
		}
		if (attrs && attrs.hasOwnProperty(attribute)) {
			return attrs[attribute];
		}
		return null;
	},
	
	getAttributesFromToken: function( token ) {
		if ( !token || !token.match ) {
			return {};
		}
		
		var uniqueString = "#####";
		while (token.indexOf(uniqueString) != -1) {
			uniqueString += "#";
		}
		
		var emptyAttributesList = token.match( /(\w+\s*\=\s*""(?:[^"]))/gi );
		if (!emptyAttributesList) emptyAttributesList = [];
		for ( var i = 0; i < emptyAttributesList.length; i++) {
			emptyAttributesList[i] = emptyAttributesList[i].replace(/[^"]$/, '');
		}
		
		var token = token.replace(/""/gi, uniqueString);
		
		var attributesList = token.match( /(\w+\s*\=\s*"[^"]*")/gi );
		if ( !attributesList) attributesList = [];
		
		attributesList = attributesList.concat(emptyAttributesList);
		
		if (!attributesList.length) return {};
		
		var attributes = new Object();

		for ( var i = 0; i < attributesList.length; i++) {
			var parts = attributesList[ i ].match( /(\w+)\s*\=\s*"([^"]*)"/i );
			if (!parts) {
				parts = attributesList[ i ].match( /(\w+)\s*\=\s*"(\w*)"[^"]/i );
			}
			var attributeName = parts[1];
			var attributeValue = parts[2];
			
			attributes[ attributeName ] = {
				value : attributeValue.replace(new RegExp(uniqueString, 'gi'), '""'), 
				original : attributesList[i].replace(new RegExp(uniqueString, 'gi'), '""')
			};
		};
		
		return attributes;
	},

	
	getDepFilesForToken: function( token, siteRoot, activeURL ) {
		var paths = MM.BC.MODULES.getTemplateFileFromToken(token, activeURL);
		if (paths) {
			for (var i = 0; i < paths.length; i++) {
				paths[i].path = MM.BC.UTILS.getFullPath(paths[i].path, activeURL, siteRoot);
			}
		}
		return paths;
	},
	
	editData : function(moduleID, context) {
		if (!dw.isConnectedToInternet()){
			alert(dw.loadString('bc/pi/module/editDataFailed'));
			return;
		}
		
		if (!MM.BC.isLoggedIn()) {
			var needToLogin = dw.loadString('bc/pi/module/pleaseLoginBeforeEditData')
			alert(needToLogin);
			MM.BC.launchLogin();
			return;
		}
		
		var dom = dw.getActiveWindow();
		var sel = dom.getSelection();
				
		var moduleCode = dom.documentElement.outerHTML.substring(sel[0], sel[1]);
		var regexResult = moduleCode.match(/\{([^\s,\}]+)[\s,\}]/);

		var moduleName = "";
		if (regexResult && regexResult[1]) {
			moduleName = regexResult[1];
		}

		var moduleCodeToSend = moduleCode;
		var site = MM.BC.SITE.getSiteObject(MM.BC.SITE.getSiteID());
		
		if (site && site.useAdvancedModuleDataEdit == false) {
			moduleCodeToSend = moduleName;
		}
		
		var module = MM.BC.MODULES.getModuleByName(moduleID);
		if (module) {
			var siteID = MM.BC.SITE.getSiteID(dw.getActiveWindow());
			MM.BC.TOKENS.getOneTimeToken(siteID, function(token) {
				var url = MM.BC.UTILS.generateURL(module.dataURL, token, moduleCodeToSend);
				MM.BC.UTILS.browseDocument(url);
			}, function(error) {
				alert(dw.loadString('bc/pi/module/editDataFailed'));
				return;
			}, false, context);
		} else {
			MM.BC.log('module with token=' + moduleID + ' was not found');
		}
	},

	editModule: function() {
		
		if (!MM.BC.isLoggedIn()) {
			var needToLogin = dw.loadString('bc/pi/module/pleaseLoginBeforeEditModule')
			alert(needToLogin);
			MM.BC.launchLogin();
			return;
		}
		
		var dom = dw.getActiveWindow();
		var sel = dom.getSelection();
		
		var moduleCode = dom.documentElement.outerHTML.substring(sel[0], sel[1]);
		var regexResult = moduleCode.match(/\{([^\s,\}]+)[\s,\}]/);

		var moduleName = "";
		if (regexResult && regexResult[1]) {
			moduleName = regexResult[1];
		}

		var module = MM.BC.MODULES.getModuleByName(moduleName);
		
		if (!module || !module.editURL) {
			var msg = dw.loadString('bc/pi/module/editModuleNotAvailable')
			alert(msg);
			return;
		}
		
		dw.runCommand("bc_configure_edit.htm", module.editURL, "", "", "edit");	
		
		if (MM.BC.codeToInsert && MM.BC.codeToInsert != "") {
			MM.BC.UTILS.insertCode(MM.BC.codeToInsert);
			MM.BC.codeToInsert = "";
		}
	},

	getTemplateFileFromToken : function(token, currentFileURL) {
		var matches = token.match( /((?:(?:module_|tag_)\w+))/i );
		
		// if not a module//
		if ( !matches || !matches.length ) {
			// check if is include //
			matches = token.match( /include\s*["']([^"']*)["']/i );
			if ( !matches || !matches.length ) {
				return null;
			}
			return [ { path :matches[1]} ];
		}
		
		var moduleObj = MM.BC.MODULES.getModuleByName(matches[1], currentFileURL);
		
		if (!moduleObj || !moduleObj.translators) return [];
		
		var translators = moduleObj.translators;

		translators.sort(MM.BC.UTILS.sortByPriority);
		
		for (var i = 0; i < translators.length; i++) {
			if (translators[i].dynamic) {
				var translatorValue = translators[i].dynamic;
				var isAttribute = translatorValue.match(/@@(\w*)@@/);
				
				// if its an attribute//
				if (isAttribute) {
					var attribute = isAttribute[1];
					var attributeObj = MM.BC.MODULES.getAttributeFromToken( token, attribute )
					if (attributeObj) {
						var path = translatorValue.replace('@@' + attribute + '@@', function (str) {
							return attributeObj.value;
						});
						return [ { path : path, editable : true} ];
					}
				} else {
					// if its a path, make sure to make it uneditable for inspector//
					return [{ path : translatorValue, editable : false}];
				}
			}
		}
		
		return [];
	},

	
	
	getModuleByName : function(name, currentFileURL) {
		var siteID = MM.BC.SITE.getSiteID(null, currentFileURL);
		
		var cachedValue = MM.BC.CACHE.getCacheValueBySite('TEMP_MODULE_CACHE', siteID, name.toLowerCase())
		if (cachedValue) {
			return cachedValue;
		}

		var modules = MM.BC.CACHE.getBCModules(siteID);

		if (modules) {
			for (var i = 0; i < modules.length; i++) {
				if (modules[i].token.toLowerCase() == name.toLowerCase()) {
					MM.BC.CACHE.cacheValueBySite('TEMP_MODULE_CACHE', siteID, name.toLowerCase(), modules[i]);
					return modules[i];
				}
			}
		}
		
		return null;
	},
	
	getModuleContentFromServer : function(token, currentFileURL) {
	
		var matches = token.match(/(module_[^\s,\}]+)/i );
		if (!matches) return null;
		
		var moduleObj = MM.BC.MODULES.getModuleByName(matches[1], currentFileURL);
		
		if (!moduleObj || !moduleObj.translators) return "";
		
		var translators = moduleObj.translators;

		if (translators.length > 1) {
			translators.sort(MM.BC.UTILS.sortByPriority);
		}
		
		for (var i = 0; i < translators.length; i++) {
			if (translators[i]["static"]) {
				return translators[i]["static"];
			}
		}

		return null;
	}
}
