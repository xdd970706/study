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

if (!MM.BC.HINTS) MM.BC.HINTS = {

	ADDED_HINTS : [],
	ADDED_BINDINGS_HINTS : [],
	
	/**
	 * Creates dynamic code hinting menus for the modules available in the current page
	 *
	 */	
	createModulesHintsMenu : function() {
		try {
			var modules = MM.BC.CACHE.getBCModules(MM.BC.SITE.getSiteID());
			var names = [];
			var values = [];
			var descriptions = [];

			modules.sort(MM.BC.UTILS.sortByToken);
			
			var posNames = [];
			var posValues = [];
			var posDescriptions = [];
			
			for (var i = 0; i < modules.length; i++) {
				var name = modules[i].token.replace(/^m/gi, '');
				
				var paramNames = [];
				var paramValues = [];
				var paramDescr = [];

				
				if (modules[i].parametersType == 0) {
					if (modules[i].parameters) {
						modules[i].parameters.sort(MM.BC.UTILS.sortByOrder);
						var positionalParams = [];
						for (var j = 0; j < modules[i].parameters.length; j++) {
							positionalParams.push(modules[i].parameters[j].name);
						}
						posNames.push("{" +  modules[i].token + "," + positionalParams.join(', ') + "}");
						posValues.push("" +  modules[i].token.replace(/^m/i, '') + "," + positionalParams.join(', ') + "}");
						posDescriptions.push(modules[i].description);
					} else {
						posNames.push("{" +  modules[i].token + "}");
						posValues.push("" +  modules[i].token.replace(/^m/i, '') + "}");
						posDescriptions.push(modules[i].description);
					}
				} else {
					names.push(modules[i].token);
					values.push(name);
					descriptions.push(modules[i].description);
					
					if (modules[i].parameters) {
						modules[i].parameters.sort(MM.BC.UTILS.sortByName);
						for (var j = 0; j < modules[i].parameters.length; j++) {
							paramNames.push(modules[i].parameters[j].name);
							paramValues.push(modules[i].parameters[j].name + '="');
							paramDescr.push(modules[i].parameters[j].description);
						}
						
					
						var hintText = "{" + modules[i].token + "\\* ";
						MM.BC.HINTS.ADDED_HINTS.push(hintText);
						
						dw.codeHints.resetMenu('BCModulesCodeHints', hintText);
						dw.codeHints.addMenu('BCModulesCodeHints', hintText, paramNames, paramValues, null, "", false, '', paramDescr, '', true, '', '', false, true);
					}
				}
			}
					
			if (posNames && posNames.length > 0) {
				dw.codeHints.addMenu('BCModulesCodeHints', "{m", posNames, posValues, null, "", false, '', posDescriptions, '', true, '', '', false, true);
				dw.codeHints.addMenu('BCModulesCodeHints', "{M", posNames, posValues, null, "", false, '', posDescriptions, '', true, '', '', false, true);
			}
			
			if (names && names.length > 0) {
				dw.codeHints.addMenu('BCModulesCodeHints', "{m", names, values, null, "", false, '', descriptions, '', true, '', '', false, true);
				dw.codeHints.addMenu('BCModulesCodeHints', "{M", names, values, null, "", false, '', descriptions, '', true, '', '', false, true);
			}
		} catch (e) {
			MM.BC.log('createModulesHintsMenu##' + e);
		}
	},
	
	/**
	 * Resets code hinting menus for modules
	 *
	 */
	resetModulesHintsMenu : function() {
		try {
			dw.codeHints.resetMenu('BCModulesCodeHints', "{m");
			dw.codeHints.resetMenu('BCModulesCodeHints', "{M");
			
			if (MM.BC.HINTS.ADDED_HINTS && MM.BC.HINTS.ADDED_HINTS.length) {
				for (var i = 0; i < MM.BC.HINTS.ADDED_HINTS.length; i++) {
					dw.codeHints.resetMenu('BCModulesCodeHints', MM.BC.HINTS.ADDED_HINTS[i]);
				}
				MM.BC.HINTS.ADDED_HINTS = [];
			}
		} catch (e) {
			
		}
	},
	
	/**
	 * Creates dynamic code hinting menus for module and include browse hints
	 *
	 */
	createBrowseHintsMenu : function() {
		// add new hints//
		dw.codeHints.addMenu('BCModulesCodeHints', '{module_\\*template="', [], [], null, "",false, "", null, "", true, "", "url");
		dw.codeHints.addMenu('BCModulesCodeHints', '{% include "', [], [], null, "",false, "", null, "", true, "", "url");
	},
	
	/**
	 * Resets code hinting menus for module and include browse hints
	 *
	 */		
	resetBrowseHintsMenu : function() {
		// reset the hints//
		dw.codeHints.resetMenu('BCModulesCodeHints', '{module_\\*template="');
		dw.codeHints.resetMenu('BCModulesCodeHints', '{% include "');
	},
	
	
	
	/**
	 * Creates dynamic code hinting menus for the tags available in the current page
	 *
	 */		
	createTagsHintsMenu : function() {
		try {
			var tags = MM.BC.BINDINGS.getFilteredTagsForFile();
			
			var names = [];
			var values = [];
			var descriptions = [];
			
			for (var i = 0; i < tags.length; i++) {
				names.push(tags[i].name);
				values.push(tags[i].name.replace(/^\{t/gi, ''));
				
				if (tags[i].description) {
					descriptions.push(tags[i].description);
				} else {
					descriptions.push('');
				}
			}
			
			if (descriptions.length != names.length) descriptions = [];
			
			dw.codeHints.addMenu('BCTagsCodeHints', "{t", names, values, null, "", false, '', descriptions, '', true);
			dw.codeHints.addMenu('BCTagsCodeHints', "{T", names, values, null, "", false, '', descriptions, '', true);

		} catch (e) {
			MM.BC.log('createModulesHintsMenu##' + e);
		}
	},
	
	
	/**
	 * Resets code hinting menus for the tags in the current page
	 *
	 */		
	resetTagsHintsMenu : function() {
		dw.codeHints.resetMenu('BCTagsCodeHints', "{t");
		dw.codeHints.resetMenu('BCTagsCodeHints', "{T");
	},
	
	

	
	/**
	 * Creates dynamic code hinting menus for the bindings available in the current page
	 *
	 */		
	createPageBindingsHintsMenu : function() {
		
		var bindings = [];
		try {
			bindings = MM.BC.BINDINGS.getFilteredBindingsForFile();
		} catch (e) {
			MM.BC.log('getFilteredBindingsForFile##' + e);
		}
		
		// list of code hints //
		var hints = [];
		var rootHint = {prefix : '{{', names : [], values : []};
		
		for (var i = 0; i < bindings.length; i++) {
			rootHint.names.push(bindings[i].name);
			rootHint.values.push(bindings[i].name);
			
			MM.BC.HINTS.addHintsForProperties('', bindings[i].name, bindings[i].type, [], hints);
		}
		
		//add root hint to hints list//
		hints.push(rootHint);
		
		// add hints items to dw code hints//
		for (var i = 0; i < hints.length; i++) {
			MM.BC.HINTS.ADDED_BINDINGS_HINTS.push(hints[i].prefix);
			dw.codeHints.addMenu('BCBindingsCodeHints', hints[i].prefix, hints[i].names, hints[i].values);
		}
		
		dw.codeHints.addMenu('BCBindingsCodeHints', "{% for\\* ", rootHint.names, rootHint.values, null, "", false, '', null, '', true, '', '', true, true);
		dw.codeHints.addMenu('BCBindingsCodeHints', "{% if\\* ", rootHint.names, rootHint.values, null, "", false, '', null, '', true, '', '', true, true);
			
	},
	
	
	/**
	 * Resets dynamic code hinting menus for the bindings available in the current page
	 *
	 */		
	resetPageBindingsHintsMenu : function() {
		dw.codeHints.resetMenu('BCBindingsCodeHints', "{% for\\* ");
		dw.codeHints.resetMenu('BCBindingsCodeHints', "{% if\\* ");
		
		try {
			if (MM.BC.HINTS.ADDED_BINDINGS_HINTS && MM.BC.HINTS.ADDED_BINDINGS_HINTS.length) {
				for (var i = 0; i < MM.BC.HINTS.ADDED_BINDINGS_HINTS.length; i++) {
					dw.codeHints.resetMenu('BCBindingsCodeHints', MM.BC.HINTS.ADDED_BINDINGS_HINTS[i]);
				}
				MM.BC.HINTS.ADDED_BINDINGS_HINTS = [];
			}
		} catch (e) {
		
		}
	},
	
	
	/**
	 * Creates dynamic code hinting menus for the properties of the bindings available in the current page
	 *
	 */		
	addHintsForProperties : function(prefix, name, type, asscendingTypes, hints) {
		// skip on loops//
		if (asscendingTypes.indexOf(type) != -1) {
			return;
		} else {
			asscendingTypes.push(type);
		}
		
		var types = MM.BC.CACHE.getBCTypes(MM.BC.SITE.getSiteID());
		
		var typeObj = MM.BC.UTILS.findEntityByName(types, type);
		if (!typeObj || typeObj == null || !typeObj.properties || typeObj.properties.length == 0) {
			return;
		}
		
		var hintPrefix;
		var names = [];
		var values = [];
		
		if (typeObj.properties && typeObj.properties.length > 0) {
			hintPrefix = name + ".";
			for (var i = 0; i < typeObj.properties.length; i++) {
				names.push(typeObj.properties[i].name);
				values.push(typeObj.properties[i].name);
				MM.BC.HINTS.addHintsForProperties(prefix + hintPrefix, typeObj.properties[i].name, typeObj.properties[i].type, asscendingTypes, hints);
			}
		}
		
		if (prefix + hintPrefix) {
			hints.push({prefix : prefix + hintPrefix, names : names, values : values});
		}
	},
	
	/**
	 * Resets all dynamic code hinting menus
	 *
	 */		
	resetAllCodeHintsMenu : function() {
		try {
		MM.BC.HINTS.resetModulesHintsMenu();
		MM.BC.HINTS.resetBrowseHintsMenu();
		MM.BC.HINTS.resetTagsHintsMenu();
		MM.BC.HINTS.resetPageBindingsHintsMenu();
		} catch (e) {
			
		}
	}
}