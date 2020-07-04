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

if (!MM.BC.BINDINGS) MM.BC.BINDINGS = {

	matchBCRulesOnCurrentPage : function() {
		var ruleRegExp, match, matches, bindings;
		var matched = [];
		var rules = {"bindingDefinition":"\\{%\\s*use\\s+((?:[\\w,\\.\\s]*)*)\\s*%\\}"}
		
		if (rules) {
			var dom = dw.getActiveWindow();
			if (!dom) return;
			
			var source = dom.source.getText(0);
			
			for (var i in rules) {
				ruleRegExp = new RegExp(rules[i], 'gi');
				matches = source.match(ruleRegExp);
				if (matches) {
					for (var j = 0; j < matches.length; j++) {
						match = matches[j].match(new RegExp(rules[i], 'i'));
						bindings = match[1].split(',');
						for (var k = 0; k < bindings.length; k++) {
							matched.push(MM.BC.UTILS.trim(bindings[k]));
						}
					}
				}
			}
		}
		return matched;
	},
	
	
	matchBCLoopsOnCurrentPage : function() {
		var dom = dw.getActiveWindow();
		if (!dom) return [];
		
		var loopRegExps = /\{\%\s*for\s+(\w+)\s+in\s+[\w|\.]+\s*\%\}/gi;
		var loopRegExp = /\{\%\s*for\s+(\w+)\s+in\s+([\w|\.]+)\s*\%\}/i;
		
		
		var source = dom.source.getText(0);
		
		var loops = [];
		var matches = source.match(loopRegExps);
		
		if (matches) {
			for (var j = 0; j < matches.length; j++) {
				var match = matches[j].match(loopRegExp);
				loops.push({name : MM.BC.UTILS.trim(match[1]), type : MM.BC.UTILS.trim(match[2])});
			}
		}
		
		return loops;
	},
	
	matchBCAssignsOnCurrentPage : function() {
		var assigns = [];
		
		var dom = dw.getActiveWindow();
		if (!dom) return;
		
		var assignRegExps = /\{\%\s*assign\s+(\w+)\s*=\s*([\w|\.]+)\s*\%\}/gi;
		var assignRegExp =  /\{\%\s*assign\s+(\w+)\s*=\s*([\w|\.]+)\s*\%\}/i;
		
		
		var source = dom.source.getText(0);
		var matches = source.match(assignRegExps);
		if (matches) {
			for (var j = 0; j < matches.length; j++) {
				var match = matches[j].match(assignRegExp);
				assigns.push({name : MM.BC.UTILS.trim(match[1]), type : MM.BC.UTILS.trim(match[2])});
			}
		}
		
		return assigns;
	},

	matchedRulesChanged : function () {
		var dom = dw.getActiveWindow();
		if (!dom) return true;
		
		var url = dw.getActiveWindow().URL;
		
		var matchedRules = MM.BC.JSON.stringify(MM.BC.BINDINGS.matchBCRulesOnCurrentPage());
		
		if (!url || !MM.BC_CACHE || !MM.BC_CACHE.MATCHED_RULES) {
			if (!MM.BC_CACHE) MM.BC_CACHE = {};
			if (!MM.BC_CACHE.MATCHED_RULES) MM.BC_CACHE.MATCHED_RULES = {};
			MM.BC_CACHE.MATCHED_RULES[url] = matchedRules;
			return true;
		}

		if (matchedRules != MM.BC_CACHE.MATCHED_RULES[url]) {
			MM.BC_CACHE.MATCHED_RULES[url] = matchedRules;
			return true;
		}
		
		return false;
	},
	
	matchedLoopsChanged : function() {
		var dom = dw.getActiveWindow();
		if (!dom) return true;
		
		var url = dw.getActiveWindow().URL;
		var matchedLoops = MM.BC.JSON.stringify(MM.BC.BINDINGS.matchBCLoopsOnCurrentPage());
		
		if (!url || !MM.BC_CACHE || !MM.BC_CACHE.MATCHED_LOOPS) {
			if (!MM.BC_CACHE) MM.BC_CACHE = {};
			if (!MM.BC_CACHE.MATCHED_LOOPS) MM.BC_CACHE.MATCHED_LOOPS = {};
			MM.BC_CACHE.MATCHED_LOOPS[url] = matchedLoops;
			return true;
		}
		
		if (matchedLoops != MM.BC_CACHE.MATCHED_LOOPS[url]) {
			MM.BC_CACHE.MATCHED_LOOPS[url] = matchedLoops;
			return true;
		}
		
		return false;
	},
	
	matchedAssignsChanged : function () {
		var dom = dw.getActiveWindow();
		if (!dom) return true;
		
		var matchedAssigns = MM.BC.JSON.stringify(MM.BC.BINDINGS.matchBCAssignsOnCurrentPage());
		
		var url = dw.getActiveWindow().URL;
		if (!url || !MM.BC_CACHE || !MM.BC_CACHE.MATCHED_ASSIGNS) {
			if (!MM.BC_CACHE) MM.BC_CACHE = {};
			if (!MM.BC_CACHE.MATCHED_ASSIGNS) MM.BC_CACHE.MATCHED_ASSIGNS = {};
			MM.BC_CACHE.MATCHED_ASSIGNS[url] = matchedAssigns;
			return true;
		}

		if (matchedAssigns != MM.BC_CACHE.MATCHED_ASSIGNS[url]) {
			MM.BC_CACHE.MATCHED_ASSIGNS[url] = matchedAssigns;
			return true;
		}
		
		return false;
	},

	flattenBindings : function(bindings, types) {
		var flattened = [];
		
		function flattenBinding(prefix, parentTypes, binding, types, flattened) {
			var typeObj = MM.BC.UTILS.findEntityByName(types, binding.type);
			if (!typeObj || typeObj == null || !typeObj.properties || typeObj.properties.length == 0) {
				return;
			}
			
			// its a loop, so skip//
			if (parentTypes.indexOf(binding.type) != -1) {
				return;
			} else {
				parentTypes.push(binding.type);
			}
			
			var newPrefix = prefix + (prefix ? "." : "") + binding.name;
			
			if (typeObj.properties && typeObj.properties.length > 0) {
				for (var i = 0; i < typeObj.properties.length; i++) {
					flattenBinding(newPrefix, parentTypes, typeObj.properties[i], types, flattened);
				}
			}
			
			if (newPrefix) {
				flattened.push({name : newPrefix, type : binding.type});
			}
		}

		for (var i = 0; i < bindings.length;i++) {
			flattenBinding("", [], bindings[i], types, flattened)
		}
		
		return flattened;
	},
	
	getServerBindingsForFile : function(filePath, returnTags, returnAll) {
	
		var bindingsRules;
		bindingsRules = MM.BC.CACHE.getBCBindings(MM.BC.SITE.getSiteID());
		
		if ((!bindingsRules || !filePath) && !returnAll) return bindingsRules;

		var fileBindings = [];

		bindingsRules.sort(MM.BC.UTILS.sortByPriority);
		
		var folder;
		var rule;
		for (var i = 0; i < bindingsRules.length; i++) {
			rule = bindingsRules[i];
			if (returnAll && rule.bindings) {
				fileBindings = fileBindings.concat(rule.bindings);
				continue;
			}
			
			if (!rule.condition || !rule.condition.pathRegExp) continue;
			var regExp;
			try {
				regExp = new RegExp('' + rule.condition.pathRegExp + "", 'gi');
			} catch (e) {
				continue;
			}
			
			var match = filePath.match(regExp);
			
			if (match) {
				// clear//
				if (rule.clear){
					fileBindings = [];
				}
				
				fileBindings = fileBindings.concat(rule.bindings);
				
				// stop//
				if (rule.stopProcessing){
					break;
				}
			}			
		}

		var fileTags = [];
		var noOfBindings = fileBindings.length;
		for (var i = noOfBindings - 1; i >= 0 ; i--) {
			if (fileBindings[i].name.match(/\{tag_/gi)) {
				var tag = fileBindings.splice(i);
				fileTags.push(tag[0]);
			}
		}

		if (returnTags) {
			return fileTags;
		}
		
		return fileBindings;
	},

	getFilteredTagsForFile : function () {
		return MM.BC.BINDINGS.getFilteredBindingsForFile(true);
	},

	getFilteredBindingsAndTagsForFile : function(){
		var bindings = MM.BC.BINDINGS.getFilteredBindingsForFile();
		var tags = MM.BC.BINDINGS.getFilteredBindingsForFile(true);
		return bindings.concat(tags);
	},
	
	getFilteredBindingsForFile : function(returnTags){
		var dom = dw.getActiveWindow();
		if (!dom) return [];
		
		var siteRoot = dw.getSiteRoot();
		var docURL = dom.URL;
		// current file url, relative to site root//
		var siteBasedURL = '/' + docURL.replace(siteRoot, '').replace(/^\//gi, '');
		
		var types = MM.BC.CACHE.getBCTypes(MM.BC.SITE.getSiteID());
		if (!types) return [];
		
		// bindings found in loops //
		var loopsBindings = MM.BC.BINDINGS.matchBCLoopsOnCurrentPage();
		
		// bindings found in assigns //
		var assignsBindings = MM.BC.BINDINGS.matchBCAssignsOnCurrentPage();

		// bindings for current file, taken from server//
		var fileBindings = MM.BC.BINDINGS.getServerBindingsForFile( siteBasedURL, returnTags );
		
		// all bindings taken from server//
		var allBindings = MM.BC.BINDINGS.getServerBindingsForFile(null, returnTags, true);
		
		// bindings found in page, based on rules (for now only "use")//
		var rulesBindings = MM.BC.BINDINGS.matchBCRulesOnCurrentPage();
		
		// if no rules were matched, we should add the bindings from server//
		var addServerBindings = (!rulesBindings || rulesBindings.length == 0 || (returnTags == true));
		var name, type;
		var binding;

		var bindingsArray = [];
		
		
		
		if (addServerBindings) {
			// add all server bindings for current page//
			for (var i = 0; i < fileBindings.length; i++) {
				type = MM.BC.UTILS.findEntityByName(types, fileBindings[i].type);
				if (type) {
				bindingsArray.push({name : fileBindings[i].name, type : fileBindings[i].type, description : type.description});
			}
			}
		} else {
			// if rules matched in page//
			var ruleBindingType;
			
			// check each matched binding//
			for (var i = 0; i < rulesBindings.length; i++) {
				// assume its a type//
				ruleBindingType = rulesBindings[i];
				
				// check if its a binding name//
				binding = MM.BC.UTILS.findEntityByName(allBindings, rulesBindings[i]);
				
				if (binding) {
					ruleBindingType = binding.type;
				}
				
				// get type object//
				type = MM.BC.UTILS.findEntityByName(types, ruleBindingType);
				
				// if type exists//
				if (type) {
					bindingsArray.push({name : rulesBindings[i], type : ruleBindingType});
				}
			}
			
			bindingsArray.push({name : "global", type : "global"});
		}
		
		if (returnTags) {
			bindingsArray.sort(MM.BC.UTILS.sortByName);
			return bindingsArray;
		}
		
		var variable, collectionType;
		var checkLast = {};
		
		// used to add bindings from loops and assigns in the bindings list//
		function addBindingsToList(fromArray, allBindings, getCollectionType) {
			var binding;
			var bindingType;
			
			// add bindings found in assigns//
			for (var i = 0; i < fromArray.length; i++) {
				var name = fromArray[i].name;
				var type = fromArray[i].type;
				
				binding = MM.BC.UTILS.findEntityByName(allBindings, type);
				
				// if its a binding//
				if (binding) {
					bindingType = binding.type;
				} else {
					binding = MM.BC.UTILS.findEntityByName(types, type)
					// if its a type//
					if (binding) {
						bindingType = type;
					} else {
						// if its not a server type, we should again at the end, maybe its a multilevel binding//
						checkLast[name] = type;
						continue;
					}
				}
				
				if (getCollectionType) {
					if (!bindingType.match(/^\[(\w*)\]$/i)) {
						continue;
					}
					// make sure we get the type, in case of collections//
					bindingType = bindingType.replace(/^\[(\w*)\]$/gi, "$1");
				}
				
				// if a type with this name is not found, skip //
				type = MM.BC.UTILS.findEntityByName(types, bindingType);
				if (!type) continue;
				
				bindingsArray.push({name : name, type : bindingType});
			}
		}
		
		// add bindings from assigns//
		addBindingsToList(assignsBindings, allBindings);
		
		// add bindings from loops//
		addBindingsToList(loopsBindings, allBindings, true);

		var flattened = MM.BC.BINDINGS.flattenBindings(bindingsArray, types);
		
		for (variable in checkLast) {
			binding = MM.BC.UTILS.findEntityByName(flattened, checkLast[variable]);
			if (binding && binding.type) {
				type = MM.BC.UTILS.findEntityByName(types, binding.type);
				if (type) {
					bindingsArray.push({name : variable, type : binding.type});
				}
			}
		}

		bindingsArray.sort(MM.BC.UTILS.sortByName);
		
		return bindingsArray;
	},

	updateBindings : function() {
		
		MM.BC.HINTS.resetPageBindingsHintsMenu();
		MM.BC.HINTS.createPageBindingsHintsMenu();
		
		MM.BC.HINTS.resetTagsHintsMenu();
		MM.BC.HINTS.createTagsHintsMenu();

		if (MM.BC.BINDINGS.updateBindingsInPanel) {
			var bindings = MM.BC.BINDINGS.getFilteredBindingsAndTagsForFile();
			MM.BC.BINDINGS.updateBindingsInPanel(bindings);
		}
	}
}