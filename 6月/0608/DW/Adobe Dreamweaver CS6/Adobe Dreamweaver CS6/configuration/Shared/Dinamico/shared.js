// Copyright 2009-2010 Adobe Systems Incorporated.  All rights reserved.

function displayHelpShared(tPage) {
	var HELP_DOC = MM.HELP_cmdSiteSpecificCodeHints;
    dwscripts.displayDWHelp(HELP_DOC+'_'+tPage);
}

if (!MM.dinamico) {
//if (true) {
MM.dinamico = {
	//properties
	structures_folder: "", //config path to structure folders
	site_file_name: "dw_php_codehinting.config",
	filter_pattern: /\s(CLASS|METHOD|PROPERTY|FUNCTION|VARIABLE)/i,
	site_root_pattern: /^\$\(SITEROOT\)/i,
	site_root_param: "$(SITEROOT)",
	sub_root_pattern: /^\[SUBROOT\]/i,
	sub_root_param: "[SUBROOT]",
	config_pattern: /^\[CONFIG\]/i,
	config_param: "[CONFIG]",
	final_slash_pattern: /\/*$/,
	file_path_pattern: /^file\:\/\/\//i,
	tree_check: "&#x2713;",
	line_break: ( (navigator.platform.toLowerCase().indexOf("mac") >= 0) ? '\n' : '\r\n' ),
	preset_order_list: ["_blank", "Drupal", "Joomla", "Wordpress"],
	
	xml: {
		main: "codehinting_structure",
		entries: "structure_entries",
		entry: "structure_entry",
	},
	
	structure_objects: [],
	structure_names: [],
	structure_file_names: [],

	selected_info: {
		preset_updated: false,
		structure_index: -1,
		custom_preset: false,
		using_custom: false,
		has_updated_locations: false,
		has_alerted_outside: (MM.dinamico_has_alerted_outside || false),
	},

	is_mac: function() {
		return (navigator.platform.toLowerCase().indexOf("mac") >= 0);
	},
	
	swap_buttons_if_mac: function() {
		if (this.is_mac()) {
			var tOKContainer = dwscripts.findDOMObject("okButtonTD");
			var tCancelContainer = dwscripts.findDOMObject("cancelButtonTD");
			var tOKButton = dwscripts.findDOMObject("okButton");
			var tCancelButton = dwscripts.findDOMObject("cancelButton");
			if (tCancelContainer && tCancelButton && tOKContainer && tOKButton &&
				tOKContainer.id && tOKButton.parentNode && tOKButton.parentNode.id &&
				tOKButton.parentNode.id == tOKContainer.id) {
				var tempHTML = String(tOKButton.outerHTML);
				tOKContainer.innerHTML = tCancelButton.outerHTML;
				tCancelContainer.innerHTML = tempHTML;
			}
		}
	},
	
	get_site_root: function(trailingSlash) {
		if (trailingSlash) {
			return this.get_trailing_slash(site.getLocalRootURL(site.getCurrentSite()));
		}
		else {
			return this.trim_trailing_slash(site.getLocalRootURL(site.getCurrentSite()));
		}
	},

	open_site_for_open_file: function() {
		var tDOM = dw.getDocumentDOM();
		if (tDOM && tDOM.URL) {
			var tSite = site.getSiteForURL(tDOM.URL);
			if (tSite && tSite != site.getCurrentSite()) {
				//set site window to proper site
				if (confirm(dw.loadString("Dinamico/Confirm/SelectSite_fileOpen"))) {
					site.setCurrentSite(tSite);
				}
			}
		}
	},

	has_site_file: function() {
		var tRoot = this.get_site_root(true);
		if (DWfile.exists(tRoot + this.site_file_name)) {
			return tRoot + this.site_file_name;
		}
		return "";
	},

	compare_file_preset_gen: function(filePath) {
		var tCont = DWfile.read(filePath).replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
		for (var n=0; n<this.structure_objects.length; n++) {
			var testConfig = this.generate_config_file(this.structure_objects[n]).replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
			if (tCont == testConfig) {
				return n;
			}
		}
		return -1;
	},
	
	compare_site_to_presets: function(siteObj) {
		var foundPreset = -1;
		for (var n=0; n<this.structure_objects.length; n++) {
			if (this.structure_objects[n].subroot && this.structure_objects[n].subroot == siteObj.subroot && this.structure_objects[n].contents_object && this.structure_objects[n].contents_object.length == siteObj.contents_object.length) {
				for (var m=0; m<this.structure_objects[n].contents_object.length; m++) {
					//ensure matches at basal level
					if ((siteObj.contents_object[m].name != this.structure_objects[n].contents_object[m].name) ||
						(siteObj.contents_object[m].isRecursive != this.structure_objects[n].contents_object[m].isRecursive) ||
						(siteObj.contents_object[m].isScanned != this.structure_objects[n].contents_object[m].isScanned) ||
						(siteObj.contents_object[m].filter != this.structure_objects[n].contents_object[m].filter) ||
						(siteObj.contents_object[m].extensions.length != this.structure_objects[n].contents_object[m].extensions.length)) {
						foundPreset = -1;
						break;
					}
					//check for any different extensions, already checked to ensure length was the same
					var badExt = false;
					for (var i=0; i<this.structure_objects[n].contents_object[m].extensions.length; i++) {
						if (siteObj.contents_object[m].extensions[i] != this.structure_objects[n].contents_object[m].extensions[i].toLowerCase()) {
							badExt = true;
							foundPreset = -1;
							break;
						}
					}
					if (badExt) break;
					//so far so good, any mismatches will reset to -1
					foundPreset = n;
				}
				//found it, stop looping
				if (foundPreset >= 0) break;
			}
		}
		return foundPreset;
	},
	read_site_file: function() {
		var tFile = this.has_site_file();
		if (tFile) {
			return this.read_config_file(tFile, true);
		}
		return false;
	},
	read_config_file: function(tFile, isSite) {
		if (tFile && DWfile.exists(tFile)) {
			var tContents = DWfile.read(tFile);
			var contArr = tContents.split(/[\n\r]+/);
			var allPaths = {};
			var usesSiteRoot = false;
			var retObj = {
				name: dw.loadString("Dinamico/Presets/Custom"),
				contents_str: "",
				subroot: "",
				contents_object: [],
				isDefault: false,
			}
			var pathChar = "/";
			var tempArr = [];
			for (var n=0; n<contArr.length; n++) {
				if (contArr[n]) {
					var tempStr = String(contArr[n]);
					var isScanned = (tempStr.search(/^#/) != 0); // check if a comment starts the line
					if(!isScanned) { //if isScanned is false, the line starts with a "#"
						tempStr = tempStr.substring(1);
						tempStr = tempStr.replace(/^\s*/, "");
					}
					var isRecursive = (tempStr.search(/^\+\s/) == 0);
					var isFolder = (isRecursive || false); //can still be a folder if not recursive
					if (isRecursive) tempStr = tempStr.substring(2);
					var extMatch = tempStr.match(/\sEXTENSIONS\(([^\)]*)\)/);
					var extArr = [];
					var filterStr = "";
					if (extMatch) {
						//has extensions, can trim out and get filterStr
						filterStr = tempStr.substring(tempStr.indexOf(extMatch[0]) + extMatch[0].length);
						tempStr = tempStr.substring(0, tempStr.indexOf(extMatch[0]));
						var tArr = extMatch[1].split(".");
						for (var m=1; m<tArr.length; m++) {
							extArr.push("." + tArr[m]);
						}
					}
					else {
						//get filterStr from search
						var tIndex = tempStr.search(this.filter_pattern);
						if (tIndex >= 0) {
							filterStr = tempStr.substring(tIndex + 1);
							tempStr = tempStr.substring(0, tIndex);
						}
						//if not found, tempStr is just the file/folder path
					}
					//trim filter string
					if (filterStr) {
						filterStr = filterStr.replace(/^\s*/, "").replace(/\s*$/, "");
					}
					//tempStr is now just the file/folder path
					tempStr = tempStr.replace(/^"/, "").replace(/"$/, "").replace(/""/g, "\"");
					if (tempStr.search(this.site_root_pattern) == 0) {
						//is site root relative path
						usesSiteRoot = true;
						allPaths[tempStr] = [true, tempStr];
					}
					else {
						//is file-system path
						tempStr = this.get_file_path_from_system(tempStr);
						var configRetObj = this.check_is_config({ new_path: tempStr });
						if (configRetObj && configRetObj.is_config) {
							tempStr = configRetObj.new_location;
						}
						allPaths[tempStr] = [false, tempStr];
					}
					if (!isFolder) isFolder = ((extMatch || extArr.length) && true);//still may be a folder, but extensions are a good clue, can only see during population of UI, unless others are found with this path...
					if (!isFolder) {
						var foldFile = this.check_fold_or_file({ path: tempStr });
						if (foldFile && foldFile.isFolder) isFolder = true;
					}
					allPaths[tempStr].push(isFolder);
					tempArr.push({
						isFolder: (isFolder && true),
						isRecursive: isRecursive,
						isScanned: isScanned,
						type: ( (isFolder) ? "folder" : "file" ),
						name: String(tempStr),
						extensions: extArr,
						filter: String(filterStr),
					});
				}
			}
			//try to find root in site notes
			if (isSite) {
				var notesInfo = this.get_settings_from_notes(tFile);
				if (notesInfo && notesInfo.name && notesInfo.subroot) {
					retObj.subroot = String(notesInfo.subroot);
					for (var n=0; n<tempArr.length; n++) {
						var tPath = String(tempArr[n].name);
						var isConfigPath = (String(tPath).search(this.config_pattern) == 0);
						var isSubRootPath = (tPath.toLowerCase().indexOf(retObj.subroot.toLowerCase()) == 0);
						if (!isSubRootPath && this.trim_trailing_slash(tPath).toLowerCase() == this.trim_trailing_slash(retObj.subroot).toLowerCase()) {
							tPath += "/";
						}
						if (isConfigPath) {
							//do nothing
						}
						else if (isSubRootPath) {
							tPath = this.sub_root_param + this.get_LS_file_insubroot(tPath, retObj.subroot);
						}
						tempArr[n].name = tPath;
						retObj.contents_object.push(tempArr[n]);
					}
					return retObj;
				}
			}
			//try to find common system path from all system paths for subroot value
			var rootPath = ( (usesSiteRoot) ? this.site_root_param + "/" : "");
			var pathData = {};
			for (var tPath in allPaths) {
				var isConfigPath = (String(tPath).search(this.config_pattern) == 0);
				if (isConfigPath) continue;
				if (!allPaths[tPath][2]) {
					//include the folder for the file
					tPath = tPath.substring(0, tPath.lastIndexOf("/") + 1);
					//keep going on, using the folder instead of the file
					//otherwise, do path info with the subfolder
				}
				var isFilePath = (String(tPath).search(this.file_path_pattern) == 0);
				var tPath2 = String(tPath).replace(this.file_path_pattern, "");
				pathArr = tPath2.split(pathChar);
				var testPath = ( (isFilePath) ? "file:///" : "" );
				for (var n=0; n<pathArr.length; n++) {
					if (pathArr[n]) {
						//if anything uses site root and the root path is not there, ignore this path
						if (usesSiteRoot && pathArr[0].search(this.site_root_pattern) != 0) break;
						//build up path from array
						testPath += pathArr[n] + ( (n < pathArr.length-1 || (n==pathArr.length-1 && pathArr[n] == "")) ? pathChar : "" );
						if (!pathData[testPath.toLowerCase()]) pathData[testPath.toLowerCase()] = { path: testPath, count: 0 };
						pathData[testPath.toLowerCase()].count++;
					}
				}
			}
			var highestLongestUsedPath = ["", 0];
			for (var lcPath in pathData) {
				var tPath = String(pathData[lcPath].path)
				var isConfigPath = (String(tPath).search(this.config_pattern) == 0);
				if (isConfigPath) continue;
				if ( (pathData[lcPath].count > highestLongestUsedPath[1]) || 
					(pathData[lcPath].count == highestLongestUsedPath[1] && tPath.length > highestLongestUsedPath[0].length) ) {
					//found a path that's used more often, or is longer in length
					highestLongestUsedPath = [tPath, parseInt(pathData[lcPath].count)];
				}
			}
			//ensure longest path is used in all paths
			for (var tPath in allPaths) {
				var isConfigPath = (String(tPath).search(this.config_pattern) == 0);
				if (isConfigPath) continue;
				if (tPath.toLowerCase().indexOf(highestLongestUsedPath[0].toLowerCase()) < 0) {
					highestLongestUsedPath = ["", 0];
				}
			}
			retObj.subroot = ((highestLongestUsedPath[0] || this.get_trailing_slash(String(this.site_root_param))));
			var pathData = {};
			for (var n=0; n<tempArr.length; n++) {
				var tPath = String(tempArr[n].name);
				var isConfigPath = (String(tPath).search(this.config_pattern) == 0);
				var isSubRootPath = (tPath.toLowerCase().indexOf(retObj.subroot.toLowerCase()) == 0);
				if (!isSubRootPath && this.trim_trailing_slash(tPath).toLowerCase() == this.trim_trailing_slash(retObj.subroot).toLowerCase()) {
					tPath += "/";
				}
				if (isConfigPath) {
					//do nothing
				}
				else if (isSubRootPath) {
					tPath = this.sub_root_param + this.get_LS_file_insubroot(tPath, retObj.subroot);
				}
				tempArr[n].name = tPath;
				retObj.contents_object.push(tempArr[n]);
			}
			return retObj;
		}
		return false;
	},
	
	get_path_data: function(rootPath, usesSiteRoot, allPaths, pathChar) {
		var pathData = {};
		for (var tPath in allPaths) {
			var isConfigPath = (String(tPath).search(this.config_pattern) == 0);
			if (isConfigPath) continue;
			if (!allPaths[tPath][2]) {
				//include the folder for the file
				tPath = tPath.substring(0, tPath.lastIndexOf("/") + 1);
				//keep going on, using the folder instead of the file
				//otherwise, do path info with the subfolder
			}
			var isFilePath = (String(tPath).search(this.file_path_pattern) == 0);
			var tPath2 = String(tPath).replace(this.file_path_pattern, "");
			var pathArr = tPath2.split(pathChar);
			var testPath = ( (isFilePath) ? "file:///" : "" );
			for (var n=0; n<pathArr.length; n++) {
				if (pathArr[n]) {
					//if anything uses site root and the root path is not there, ignore this path
					if (usesSiteRoot && pathArr[0].search(this.site_root_pattern) != 0) break;
					//build up path from array
					testPath += pathArr[n] + ( (n < pathArr.length-1 || (n==pathArr.length-1 && pathArr[n] == "")) ? pathChar : "" );
					if (!pathData[testPath.toLowerCase()]) pathData[testPath.toLowerCase()] = { path: testPath, count: 0 };
					pathData[testPath.toLowerCase()].count++;
				}
			}
		}
		return pathData;
	},
	
	//userDefined = true, check user defined ones
	//userDefined = false, only default ones
	inspect_folder_for_preset: function(tFolder, userDefined) {
		var presetIndex = -1;
		var siteRoot = this.get_site_root(true);
		for (var n=0; n<this.structure_objects.length; n++) {
			var isDefault = false;
			for (var m=0; m<this.preset_order_list.length; m++) {
				if (this.structure_objects[n].name == this.preset_order_list[m]) {
					isDefault = true;
					break;
				}
			}
			if ((!userDefined && isDefault) || (userDefined && !isDefault)) {
				if (!this.structure_objects[n].contents_object.length) continue;
				var continueScan = true;
				if (this.structure_objects[n].subroot) {
					continueScan = false;
					if (this.structure_objects[n].subroot.search(this.site_root_pattern) == 0) {
						continueScan = true;
					}
				}
				if (!continueScan) continue;
				continueScan = false;
				if (DWfile.exists(tFolder)) {
					continueScan = true;
					for (var m=0; m<this.structure_objects[n].contents_object.length; m++) {
						if (this.structure_objects[n].contents_object[m].name.search(this.config_pattern) == 0) {
							continue;
						}
						else if (!DWfile.exists(this.structure_objects[n].contents_object[m].name.replace(this.sub_root_pattern, tFolder))) {
							continueScan = false;
							break;
						}
					}
					if (!continueScan) continue;
				}
				//otherwise, it matches fully
				presetIndex = n;
				break;
			}
		}
		if (presetIndex < 0) {
			if (!userDefined) {
				var retObj = this.inspect_folder_for_preset(tFolder, true);
				if (retObj.index >= 0) {
					return retObj;
				}
			}
			else {
				var tFolders = DWfile.listFolder(tFolder, "directories");
				for (var m=0; m<tFolders.length; m++) {
					var testFolder = tFolder + tFolders[m] + "/";
					var retObj = this.inspect_folder_for_preset(testFolder, false);
					if (retObj.index >= 0) {
						return retObj;
					}
				}
			}
		}
		return {
			folder: tFolder,
			index: presetIndex
		}
	},
	
	inspect_site_for_preset: function() {
		var presetIndex = -1;
		var siteRoot = this.get_site_root(true);
		return this.inspect_folder_for_preset(siteRoot, false);
	},

	compare_site_to_notes: function(filePath) {
		if (!filePath) filePath = MM.dinamico.has_site_file();
		if (filePath) {
			var tNotes = this.get_settings_from_notes(filePath);
			if (tNotes && tNotes.name && tNotes.subroot) {
				if (tNotes.name == this.preset_order_list[0] || tNotes.name == dw.loadString("Dinamico/Presets/Custom")) {
					return -1;//they used blank or custom, should be -1
				}
				var tCont = DWfile.read(filePath).replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
				for (var n=0; n<this.structure_objects.length; n++) {
					if (this.structure_objects[n].name == tNotes.name) {
						var tempObj = this.structure_objects[n];
						tempObj.subroot = String(tNotes.subroot);
						var testConfig = this.generate_config_file(tempObj).replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase();
						if (tCont == testConfig) {
							return n;
						}
					}
				}
			}
		}
		return -1;
	},							
									
	get_settings_from_notes: function(filePath) {
		if (!filePath) filePath = MM.dinamico.has_site_file();
		var notesFile = MMNotes.open(filePath, true);
		var tName = "";
		var tRoot = "";
		if (notesFile) {
			tName = MMNotes.get(notesFile, "selected_structure") || "";
			tRoot = MMNotes.get(notesFile, "sub_root") || "";
			MMNotes.close(notesFile);
		}
		return {
			name: tName,
			subroot: tRoot,
		}
	},
	
	set_notes_from_preset: function(filePath, presetObj) {
		var notesFile = MMNotes.open(filePath, true);
		if (notesFile) {
			MMNotes.set(notesFile, "selected_structure", presetObj.name);
			MMNotes.set(notesFile, "sub_root", presetObj.subroot);
			MMNotes.close(notesFile);
		}
	},

	load_structures: function(props) {
		if (!props) props = {};
		var opts = {
			force_load: (props.force_load || false),
		}
		if (!opts.force_load && this.structure_objects.length) {
			return this.structure_objects;
		}
		//ensure we're working from the user directory
		this.structure_objects = [];
		this.structure_names = {};
		this.structure_file_names = {};
		this.get_local_structures();
		var loadFolder = this.get_local_folder();
		var loadFiles = DWfile.listFolder(loadFolder + "*.xml", "files");
		this.structure_objects = [];
		for (var n=0; n<loadFiles.length; n++) {
			if (loadFiles[n].toLowerCase() == ".xml") {
				//invalid file based on bad name in save ui, fix for bug 5909, build 013
				DWfile.remove(loadFolder + loadFiles[n]);
				continue;
			}
			else {
				//store in array and name in hash table of indeces + 1
				var tStructure = this.load_structure({ xml: DWfile.read(loadFolder + loadFiles[n]) });
				if (tStructure) {
					tStructure.index = parseInt(this.structure_objects.length);
					this.structure_objects.push(tStructure);
					this.structure_names[this.structure_objects[this.structure_objects.length-1].name.toLowerCase()] = this.structure_objects[this.structure_objects.length-1];
					this.structure_file_names[loadFiles[n].substring(0, loadFiles[n].indexOf(".")).toLowerCase()] = this.structure_objects[this.structure_objects.length-1];
				}
			}
		}
		return this.structure_objects;
	},

	load_structure: function(props) {
		if (!props) props = {};
		var opts = {
			xml: String(props.xml || "")
		}
		var retObj = {
			name: "",
			contents_str: String(opts.xml),
			subroot: "",
			contents_object: [],
			isDefault: false,
		}
		if (opts.xml) {
			var tempDOM = dw.getNewDocumentDOM("XML");
			tempDOM.documentElement.outerHTML = String(opts.xml);
			var mainNode = tempDOM.getElementsByTagName(this.xml.main);
			if (!mainNode || !mainNode.length) {
				alert(dw.loadString("Dinamico/Alert/Import_Fail"));
				return false;
			}
			else {
				mainNode = mainNode[0];
				retObj.name = String(( (mainNode.getAttribute("name")) ? mainNode.getAttribute("name") : "" ));
				retObj.subroot = unescape(String(( (mainNode.getAttribute("subroot")) ? mainNode.getAttribute("subroot") : this.site_root_param + "/" )));
				retObj.isDefault = (mainNode.getAttribute("default") && mainNode.getAttribute("default") == "default");
				retObj.contents_object = this.load_contents(mainNode);
				if (!retObj.contents_object) {
					alert(dw.loadString("Dinamico/Alert/Import_Fail"));
					return false;
				}
			}
			dw.releaseDocument(tempDOM);
		}
		return retObj;
	},
	
	load_contents: function(xmlNode) {
		var retArr = [];
		var entryWrapper = xmlNode.getElementsByTagName(this.xml.entries);
		if (!entryWrapper || !entryWrapper.length) {
			return false;
		}
		if (entryWrapper && entryWrapper.length && entryWrapper[0].childNodes && entryWrapper[0].childNodes.length) {
			for (var n=0; n<entryWrapper[0].childNodes.length; n++) {
				var tObj = {
					isFolder: (entryWrapper[0].childNodes[n].getAttribute("type") && entryWrapper[0].childNodes[n].getAttribute("type") == "folder"),
					type: ( (entryWrapper[0].childNodes[n].getAttribute("type")) ? String(entryWrapper[0].childNodes[n].getAttribute("type")) : "file" ),
					name: unescape(( (entryWrapper[0].childNodes[n].getAttribute("name")) ? unescape(String(entryWrapper[0].childNodes[n].getAttribute("name"))) : "unknown" )),
					isRecursive: (entryWrapper[0].childNodes[n].getAttribute("recursive") && entryWrapper[0].childNodes[n].getAttribute("recursive") == "recursive"),
					isScanned: (entryWrapper[0].childNodes[n].getAttribute("scan") && entryWrapper[0].childNodes[n].getAttribute("scan") == "on"),
					extensions: unescape(( (entryWrapper[0].childNodes[n].getAttribute("extensions")) ? unescape(String(entryWrapper[0].childNodes[n].getAttribute("extensions"))) : "" )),
					filter: unescape(( (entryWrapper[0].childNodes[n].getAttribute("filter")) ? unescape(String(entryWrapper[0].childNodes[n].getAttribute("filter"))) : "" )),
				}
				var extArr = [];
				if (tObj.extensions) {
					var tArr = String(tObj.extensions).split(".");
					for (var m=1; m<tArr.length; m++) {
						extArr.push("." + tArr[m]);
					}
				}
				tObj.extensions = extArr;
				retArr.push(tObj);
			}
		}
		return retArr;
	},
	
	get_subroot_filepath: function(tPath) {
		if (!tPath) tPath = this.site_root_param + "/";
		var siteRoot = this.get_site_root(true);
		if (tPath && tPath.search(this.site_root_pattern) == 0) {
			var tStr = tPath.replace(this.site_root_pattern, "");
			tPath = siteRoot + tStr.replace(/^\/*/, "");
		}
		else {
			tPath = this.get_file_path_from_system(tPath);
		}
		return tPath;
	},
	
	get_config_path: function(pathFromConfig) {
		var addVolumes = false;
		if (!pathFromConfig)  {
			pathFromConfig = "";
		}
		var tPath  = String(dw.getTempFolderPath());
		var config = String(dw.getConfigurationPath());
		if (tPath.lastIndexOf("/") >= 0)  {
			tPath = tPath.substring(0, tPath.lastIndexOf("/"));  // strip out the temp
		}
		if (config.lastIndexOf("/") >= 0)  {
			config = config.substring(8);
			config = config.substring(0, config.indexOf("/"));  // get hard drive name
		}
		tPath += pathFromConfig;
		var origTPath = tPath;
		//add in /Volumes to make mac paths resolve more consistently (cs3 or in certain cases for cs4 - addVolumes=true)
		if (navigator.platform.toLowerCase().indexOf("mac") >= 0 && ((tPath.indexOf('/Volumes') < 0 && parseInt(dw.appVersion) == 9) || addVolumes)) {
			tPath = 'file:///Volumes/' + tPath.substring(8);
		}  
		if (DWfile.exists(tPath)) {
			return tPath;
		}
		else  {
			if(navigator.platform.toLowerCase().indexOf("mac") >= 0 && ((origTPath.indexOf('/Volumes') < 0 && parseInt(dw.appVersion) == 9) || addVolumes) && origTPath.indexOf(config) < 0) {
				tPath = 'file:///Volumes/'+config+'/Users/' + origTPath.substring(8);
			} 
			if (DWfile.exists(tPath)) {
				return tPath;
			}
		}
		if (navigator.platform.toLowerCase().indexOf("mac") < 0 && dw.appName.toLowerCase().indexOf("dreamweaver") >= 0 && parseInt(dw.appVersion) >= 7) { 
			// Block to account for Vista paths
			var nPath = tPath.substring(0,tPath.indexOf("|")+1)+"/Users/Public/Roaming/"+tPath.substring(tPath.indexOf("Adobe"));  
			if (DWfile.exists(nPath))  {
				return nPath;
			}
			// end Vista block
			var aPath = dw.getTempFolderPath();
			aPath = aPath .substring(0, aPath .lastIndexOf("/"));  // strip out the temp
			var rootPath = aPath;
			for (var x=0; x<4 && rootPath.lastIndexOf("/")>0; x++)  {
				rootPath = rootPath.substring(0, rootPath.lastIndexOf("/"));
			}
			var dataIndex = rootPath.length+1;  
			var beforePath = aPath.substring(0, dataIndex-2);
			var afterPath = aPath.substring(dataIndex);
			var folderContents = DWfile.listFolder(beforePath.substring(0, beforePath.lastIndexOf("/")),"directories");
			for (var x=0; x<folderContents.length; x++)  {
				if (folderContents[x].toLowerCase().indexOf("all users")==0) {
					aPath = beforePath.substring(0, beforePath.lastIndexOf("/")) + "/"+folderContents[x]+"/" + afterPath + pathFromConfig;
					if (DWfile.exists(aPath)) {
						return aPath;
					}
				}
			}
		}
		var cPath = dw.getConfigurationPath();
		cPath += pathFromConfig;
		if (DWfile.exists(cPath)) {
			return cPath;
		}
		return tPath;
	},
	
	check_is_config: function(params) {
		if (!params) params = {};
		var opts = {
			is_config: false,
			new_path: params.new_path,
			new_location: params.new_location || "",
		}
		var tPath  = String(dw.getTempFolderPath());
		var config = String(dw.getConfigurationPath());
		if (tPath.lastIndexOf("/") >= 0)  {
			tPath = tPath.substring(0, tPath.lastIndexOf("/"));  // strip out the temp
		}
		if (opts.new_path.toLowerCase().indexOf(tPath.toLowerCase()) == 0) {
			opts.is_config = true;
			opts.new_location = this.config_param + this.get_LS_file_insubroot(opts.new_path, tPath);
			return opts;
		}
		if (opts.new_path.toLowerCase().indexOf(config.toLowerCase()) == 0) {
			opts.is_config = true;
			opts.new_location = this.config_param + this.get_LS_file_insubroot(opts.new_path, config);
			return opts;
		}
		if (config.lastIndexOf("/") >= 0)  {
			config = config.substring(8);
			config = config.substring(0, config.indexOf("/"));  // get hard drive name
		}
		//brute-force technique
		var nPath = String(opts.new_path);
		var tempArr = String(nPath).split("/");
		var tempStr = String(nPath);
		for (var n=0; n<tempArr.length; n++) {
			tempStr = tempStr.substring(0, tempStr.lastIndexOf("/"));
			//if the config path is the same as the new path, it's been found and we're good to go
			var tempPath = this.get_config_path(nPath.substring(tempStr.length));
			if (tempPath.toLowerCase() == nPath.toLowerCase()) {
				opts.is_config = true;
				opts.new_location = this.config_param + this.get_LS_file_insubroot(nPath, tempStr);
				return opts;
			}
		}
		return opts;
	},
	
	get_preset_filepath: function(tObj, tPath) {
		if (!tObj) tObj = ( (this.selected_info.using_custom) ? this.selected_info.custom_preset : this.structure_objects[this.selected_info.structure_index] );
		if (tPath.search(this.config_pattern) == 0) {
			tPath = tPath.replace(this.config_pattern, "");
			tPath = this.get_config_path(("/" + tPath).replace(/^\/*/, "/"));
		}
		else if (tPath.search(this.sub_root_pattern) == 0) {
			var tRoot = this.trim_trailing_slash(this.get_subroot_filepath(tObj.subroot));
			tPath = tPath.replace(this.sub_root_pattern, "");
			tPath = tRoot + ("/" + tPath).replace(/^\/*/, "/");
		}
		else if (tPath.search(this.site_root_pattern) == 0) {
			var tRoot = this.get_site_root(false);
			tPath = tPath.replace(this.site_root_pattern, "");
			tPath = tRoot + ("/" + tPath).replace(/^\/*/, "/");
		}
		else {
			tPath = this.get_file_path_from_system(tPath);
		}
		return tPath;
	},
	
	populate_preset_list: function(listObj) {
		var nameArr = {};
		var labelArr = [];
		var valueArr = [];
		for (var n=0; n<this.structure_objects.length; n++) {
			if (this.structure_objects[n].name) {
				nameArr[this.structure_objects[n].name] = n;
			}
		}
		var orderedNames = {};
		for (var n=0; n<this.preset_order_list.length; n++) {
			if (nameArr[this.preset_order_list[n]] != null) {
				orderedNames[this.preset_order_list[n]] = true;
				labelArr.push(( (n == 0) ? dw.loadString("Dinamico/Presets/Blank") : this.preset_order_list[n] ));
				valueArr.push(nameArr[this.preset_order_list[n]]);
			}
		}
		for (var n=0; n<this.structure_objects.length; n++) {
			if (!orderedNames[this.structure_objects[n].name]) {
				orderedNames[this.structure_objects[n].name] = true;
				labelArr.push(this.structure_objects[n].name);
				valueArr.push(n);
			}
		}
		listObj.setAll(labelArr, valueArr);
	},
	
	populate_structure_tree: function(treeObj) {
		var tPreset = ( (this.selected_info.using_custom) ? this.selected_info.custom_preset : this.structure_objects[this.selected_info.structure_index] );
		var subRoot = this.trim_trailing_slash(this.get_subroot_filepath(tPreset.subroot));
		var subRootFolder = this.get_trailing_slash(subRoot);
		var usedPaths = {};
		var siteRootPath = this.get_subroot_filepath();
		var treeData = {};
		var numToRoot = -1;
		var configPath = "";
		var configFolder = "";
		for (var n=0; n<tPreset.contents_object.length; n++) {
			var tPath = this.get_preset_filepath(tPreset, String(tPreset.contents_object[n].name));
			var isFromConfig = (String(tPreset.contents_object[n].name).search(this.config_pattern) == 0);
			var isFromRoot = (String(tPreset.contents_object[n].name).search(this.sub_root_pattern) == 0 ||
								tPath.toLowerCase() == subRoot.toLowerCase() ||
								tPath.toLowerCase() == subRootFolder.toLowerCase() ||
								tPath.toLowerCase().indexOf(subRootFolder.toLowerCase()) == 0);
			if (isFromRoot && tPath.toLowerCase() == subRoot.toLowerCase()) {
				tPath = this.get_trailing_slash(tPath);
			}
			var tName = String(tPreset.contents_object[n].name).replace(this.sub_root_pattern, "").replace(this.config_pattern, "");
			if (isFromConfig) {
				tName = tName.replace(/^\/*/, "");
				var tArr = tName.split("/");
				configPath = tPath.substring(0, tPath.length-tName.length);
				configPath = this.get_trailing_slash(configPath);
				configFolder = String(configPath);
				var dataPath = String(configPath.toLowerCase());
				 /* fix trailing slash*/
				if (!treeData[dataPath] && treeData[this.get_trailing_slash(dataPath)]) dataPath = this.get_trailing_slash(dataPath);
				if (!treeData[dataPath] && treeData[this.trim_trailing_slash(dataPath)]) dataPath = this.trim_trailing_slash(dataPath);

				if (!treeData[dataPath]) {
					if (!usedPaths[dataPath]) usedPaths[dataPath] = 0;
					usedPaths[dataPath]++;
					treeData[dataPath] = {
						is_config: true,
						is_root: false,
						config_loc: String(this.config_param),
						path: String(configPath),
						isFolder: true,
						scan: false,
						isRecursive: false,
						extensions: [],
						content_index: -1,
						children: [],
					}
				}
			}
			else if (isFromRoot) 
			{
				var tArr = tPath.substring(subRootFolder.length).split("/");
				var dataPath = String(subRootFolder.toLowerCase());
				if (!treeData[dataPath] && treeData[this.get_trailing_slash(dataPath)]) dataPath = this.get_trailing_slash(dataPath);
				if (!treeData[dataPath] && treeData[this.trim_trailing_slash(dataPath)]) dataPath = this.trim_trailing_slash(dataPath);
				if (!treeData[dataPath]) {
					if (!usedPaths[dataPath]) usedPaths[dataPath] = 0;
					usedPaths[dataPath]++;
					treeData[dataPath] = {
						is_config: false,
						is_root: true,
						path: String(subRoot),
						isFolder: true,
						scan: false,
						isRecursive: false,
						extensions: [],
						content_index: -1,
						children: [],
					}
				}
			}
			else {
				var tArr = tPath.substring(8).split("/");  // remove "file:///" then split
			}
			var tempPath = "";

			for (var m=0; m<tArr.length; m++) {
				if (m != tArr.length-1) {
					tempPath += tArr[m] + "/";
					tempPath = this.get_trailing_slash(tempPath);
					if (isFromConfig) {
						var fullTempPath = configFolder + tempPath;
					}
					else if (isFromRoot) {
						var fullTempPath = subRootFolder + tempPath;
					}
					else {
						var fullTempPath = "file:///" + tempPath;
					}

					// WTF? We already added "configFolder" at the beginning of fullTempPath... these tests should never ever be true!
					if (isFromConfig && configPath.toLowerCase().indexOf(fullTempPath.toLowerCase()) == 0) continue;//ignore until we are beyond the subroot
					if (isFromRoot && subRoot.toLowerCase().indexOf(fullTempPath.toLowerCase()) == 0) continue;
				}
				else {
					tempPath += tArr[m];
					if (tPreset.contents_object[n].isFolder) {
						tempPath = this.get_trailing_slash(tempPath);
						if (isFromConfig) {
							var fullTempPath = configFolder + tempPath;
						}
						else if (isFromRoot) {
							var fullTempPath = subRootFolder + tempPath;
						}
						else {
							var fullTempPath = "file:///" + tempPath;
						}
					}
					else {
						if (isFromConfig) {
							var fullTempPath = configFolder + tempPath;
						}
						else if (isFromRoot) {
							var fullTempPath = subRootFolder + tempPath;
						}
						else {
							var fullTempPath = "file:///" + tempPath;
						}
						var folderContents = DWfile.listFolder(fullTempPath.substring(0, fullTempPath.lastIndexOf("/")), "directories");
						if (folderContents && folderContents.length) {
							for (var i=0; i<folderContents.length; i++) {
								if (folderContents[i].toLowerCase() == tArr[m].toLowerCase()) {
									tPreset.contents_object[n].isFolder = true;
									tempPath = this.get_trailing_slash(tempPath)
									fullTempPath = String(this.get_trailing_slash(fullTempPath));
									break;
								}
							}
						}
					}
				}
				var dataPath = String(fullTempPath.toLowerCase());
				if (!treeData[dataPath] && treeData[this.get_trailing_slash(dataPath)]) {
					dataPath = this.get_trailing_slash(dataPath);
					tempPath = this.get_trailing_slash(tempPath);
					fullTempPath = this.get_trailing_slash(fullTempPath);
					isFolder = true;
				}
				if (!treeData[dataPath] && treeData[this.trim_trailing_slash(dataPath)]) {
					dataPath = this.trim_trailing_slash(dataPath);
					tempPath = this.trim_trailing_slash(tempPath);
					fullTempPath = this.trim_trailing_slash(fullTempPath);
				}
				if (tempPath.charAt(tempPath.length-1) == "/") tempPath = this.get_trailing_slash(tempPath);
				if (fullTempPath.charAt(fullTempPath.length-1) == "/") fullTempPath = this.get_trailing_slash(fullTempPath);
				if (!usedPaths[dataPath]) usedPaths[dataPath] = 0;
				usedPaths[dataPath]++;
				if (!treeData[dataPath]) {
					treeData[dataPath] = {
						is_config: (isFromConfig && true),
						config_loc: ( (isFromConfig) ? this.config_param + fullTempPath.substring(configFolder.length) : ""),
						is_root: (isFromRoot && true),
						path: String(fullTempPath),
						isFolder: (m != tArr.length-1 || (tPreset.contents_object[n].isFolder && true)),
						scan: false,
						isRecursive: false,
						extensions: [],
						content_index: -1,
						children: [],
					};
				}
			}
			var dataPath = String(fullTempPath.toLowerCase());
			if (!treeData[dataPath] && treeData[this.get_trailing_slash(dataPath)]) dataPath = this.get_trailing_slash(dataPath);
			if (!treeData[dataPath] && treeData[this.trim_trailing_slash(dataPath)]) dataPath = this.trim_trailing_slash(dataPath);
			tPreset.contents_object[n].isFolder = (treeData[dataPath].isFolder && true);
			treeData[dataPath].scan = tPreset.contents_object[n].isScanned && true;
			treeData[dataPath].is_config = (isFromConfig && true);
			treeData[dataPath].config_loc = ( (isFromConfig) ? this.config_param + this.get_LS_file_insubroot(fullTempPath, configFolder) : ""),
			treeData[dataPath].isRecursive = (tPreset.contents_object[n].isFolder && tPreset.contents_object[n].isRecursive);
			treeData[dataPath].extensions = ( (tPreset.contents_object[n].isFolder) ? tPreset.contents_object[n].extensions : [] );
			treeData[dataPath].content_index = n;
		}
		for (var filePath in treeData) {
			var tObj = treeData[filePath];
			var isFromConfig = (tObj.is_config && true);
			var isFromRoot = (String(filePath).toLowerCase().indexOf(subRootFolder.toLowerCase()) == 0 || filePath.toLowerCase() == subRoot.toLowerCase());
			if (!isFromRoot && this.trim_trailing_slash(filePath).toLowerCase() == this.trim_trailing_slash(subRoot).toLowerCase()) {
				isFromRoot = true;
				tObj.path += "/";
			}
			var pathStr = "";
			if (isFromConfig) {
				var tPath = String(tObj.path).substring(configFolder.length);
				var fullTempPath = String(configFolder);
				tPath = tPath.replace(/^\/*/, "");
				fullTempPath = this.get_trailing_slash(fullTempPath);
				pathStr = String(tObj.path).substring(configFolder.length);
				priorTempPath = String(fullTempPath);
			}
			else if (isFromRoot) {
				var tPath = String(tObj.path);
				if (tPath == subRoot) {
					tPath = "";
				}
				else {
					tPath = tPath.substring(subRootFolder.length);
				}
				var fullTempPath = String(subRootFolder);
				pathStr = String(tPath);
				priorTempPath = String(fullTempPath);
			}
			else {
				var tPath = String(tObj.path).substring(8);
				pathStr = String(tObj.path).substring(8);
				var fullTempPath = "file:///";
			}
			var tArr = pathStr.split("/");
			if (!pathStr) pathStr = "/";
			//strip out last folder in tempPath
			priorTempPath = fullTempPath + this.trim_trailing_slash(tPath);
			priorTempPath = priorTempPath.substring(0, priorTempPath.lastIndexOf("/") + 1);
			for (n=0; n<tArr.length; n++) {
				if (tArr[n] != "") {
					fullTempPath += tArr[n];
					if ((n == tArr.length-1 && tObj.isFolder) || n < tArr.length-1) {
						fullTempPath = this.get_trailing_slash(fullTempPath);
					}
					priorTempPath = this.get_trailing_slash(priorTempPath);
					if (fullTempPath.toLowerCase().indexOf(priorTempPath.toLowerCase()) == 0 && this.get_trailing_slash(fullTempPath).toLowerCase() != priorTempPath.toLowerCase()) {
						var dataPath = String(priorTempPath.toLowerCase());
						if (!treeData[dataPath] && treeData[this.get_trailing_slash(dataPath)]) dataPath = this.get_trailing_slash(dataPath);
						if (!treeData[dataPath] && treeData[this.trim_trailing_slash(dataPath)]) dataPath = this.trim_trailing_slash(dataPath);
						if (treeData[dataPath]) {
							var foundChild = false;
							if (this.get_trailing_slash(fullTempPath).toLowerCase() == subRootFolder.toLowerCase() || this.get_trailing_slash(fullTempPath).toLowerCase() == configFolder.toLowerCase()) {
								//do not add as child if the path is the sub-root or the config folder... this wouldn't make sense
								foundChild = true;
							}
							else {
								for (var c=0; c<treeData[dataPath].children.length; c++) {
									if (treeData[dataPath].children[c].toLowerCase() == fullTempPath.toLowerCase() ||
										this.get_trailing_slash(treeData[dataPath].children[c]).toLowerCase() == fullTempPath.toLowerCase() ||
										this.trim_trailing_slash(treeData[dataPath].children[c]).toLowerCase() == fullTempPath.toLowerCase()) {
										treeData[dataPath].isFolder = true;
										foundChild = true;
										break;
									}
								}
							}
							if (!foundChild) {
								treeData[dataPath].children.push(fullTempPath);
								treeData[dataPath].isFolder = true;
								if (dataPath != this.get_trailing_slash(dataPath)) {
									treeData[this.get_trailing_slash(dataPath)] = treeData[dataPath];
									treeData[dataPath] = null;
									dataPath = this.get_trailing_slash(dataPath);
								}
							}
						}
					}
					priorTempPath = String(fullTempPath);
				}
			}
			if (treeData[filePath.toLowerCase()].children.length) {
				treeData[filePath.toLowerCase()].isFolder = true;
			}
		}
		//find children
		subRoot = this.get_trailing_slash(subRoot);
		var treeHTML = "";
		for (var n=0; n<treeObj.columns.length; n++) {
			treeHTML += treeObj.columns[n].outerHTML;
		}
		var includedPaths = {};
		for (var tPath in treeData) {
			if (treeData[tPath]) {
				if (!this.path_is_child(tPath, treeData)) {
					var entryPath = String(treeData[tPath].path);
					if (treeData[tPath].is_config) {
						entryPath = this.config_param + this.get_LS_file_insubroot(entryPath, configFolder);
					}
					if (entryPath.toLowerCase().indexOf(subRoot.toLowerCase()) == 0) {
						entryPath = this.sub_root_param + this.get_LS_file_insubroot(entryPath, subRootFolder);
						if (entryPath == this.sub_root_param) entryPath += "/";
						else entryPath = this.trim_trailing_slash(entryPath);
					}
					else if (this.get_trailing_slash(entryPath).toLowerCase() == this.get_trailing_slash(subRootFolder).toLowerCase()) {
						entryPath = this.get_trailing_slash(this.sub_root_param);
					}
					else if (entryPath.toLowerCase() == this.trim_trailing_slash(subRootFolder).toLowerCase()) {
						entryPath = this.get_trailing_slash(this.sub_root_param);
					}
					if (includedPaths[tPath.toLowerCase()]) continue;
					if (includedPaths[this.trim_trailing_slash(tPath).toLowerCase()]) continue;
					if (includedPaths[this.get_trailing_slash(tPath).toLowerCase()]) continue;
					var retObj = this.get_tree_html_recursive(subRoot, treeData[tPath].path, entryPath, treeData, includedPaths, true);
					treeHTML += retObj.html;
					includedPaths = retObj.includedPaths;
				}
			}
		}
		treeObj.object.innerHTML = treeHTML;
		treeObj.initTreeControl();
	},
	
	path_is_child: function(checkPath, treeData) {
		for (var tPath in treeData) {
			for (var tPath2 in treeData) {
				if (treeData[tPath2].children && treeData[tPath2].children.length) {
					for (var n=0; n<treeData[tPath2].children.length; n++) {
						if (treeData[tPath2].children[n].toLowerCase() == checkPath.toLowerCase() ||
							this.trim_trailing_slash(treeData[tPath2].children[n]).toLowerCase() == this.trim_trailing_slash(checkPath).toLowerCase() ||
							this.get_trailing_slash(treeData[tPath2].children[n]).toLowerCase() == this.get_trailing_slash(checkPath).toLowerCase()) {
							return true;
						}
					}
				}
			}
		}
		return false;
	},
	
	get_tree_html_recursive: function(subRoot, fullPath, entryPath, treeData, includedPaths, isMain) {
		var dataPath = String(fullPath.toLowerCase());
		if (!treeData[dataPath] && treeData[this.get_trailing_slash(dataPath)]) dataPath = this.get_trailing_slash(dataPath);
		if (!treeData[dataPath] && treeData[this.trim_trailing_slash(dataPath)]) dataPath = this.trim_trailing_slash(dataPath);
		var tObj = treeData[dataPath];
//if (!tObj) {
//alert("subRoot: " + subRoot + "\n" + "fullPath: " + fullPath + "\n" + "entryPath: " + entryPath + "\n" + "treeData: " + treeData[fullPath] + "\n" + "includedPaths: " + includedPaths[fullPath] + "\n" + "isMain: " + isMain + "\n" + "testPath:" + fullPath.replace(this.final_slash_pattern, "") + "\n" + treeData[fullPath.replace(this.final_slash_pattern, "").toLowerCase()] + "\n" + includedPaths[fullPath.replace(this.final_slash_pattern, "").toLowerCase()]);
//}
		includedPaths[fullPath.toLowerCase()] = true;
		if (!tObj) {
			return { html: "", includedPaths: includedPaths };
		}
		var tValue = "";
		if (tObj.is_config) {
			tValue = String(tObj.config_loc).replace(this.config_pattern, "");
			if (tValue == "" || tValue == "/") {
				tValue = dw.loadString("Dinamico/Main/Tree/DWConfig");
			}
			tValue = this.trim_trailing_slash(tValue);
			tValue = tValue.replace(/^\/*/, "");
			if (tValue.indexOf("/") >= 0) {
				tValue = tValue.substring(tValue.lastIndexOf("/") + 1);
			}
		}
		else if (entryPath.search(this.sub_root_pattern) == 0) {
			tValue = entryPath.replace(this.sub_root_pattern, "");
			if (tValue == "" || tValue == "/") {
				tValue = dw.loadString("Dinamico/Main/Tree/Subroot");
			}
			tValue = this.trim_trailing_slash(tValue);
			tValue = tValue.replace(/^\/*/, "");
			if (tValue.indexOf("/") >= 0) {
				tValue = tValue.substring(tValue.lastIndexOf("/") + 1);
			}
		}
		else {
			tValue = this.trim_trailing_slash(entryPath);
			tValue = tValue.substring(tValue.lastIndexOf("/") + 1);
		}
		var extStr = "";
		for (var n=0; n<tObj.extensions.length; n++) {
			extStr += ( (n != 0) ? ", " : "" ) + escape(tObj.extensions[n]);
		}
		tValue = this.trim_trailing_slash(tValue).replace(/\|/g, ":").replace(/"/g, "&quot;");
		tValue += "|" + ( (tObj.scan) ? this.tree_check : "" ) +
					"|" + ( (tObj.isRecursive) ? this.tree_check : "" ) +
					"|" + extStr;
		var folderHTML = "";
		var fileHTML = "";
		var retHTML = '<mm:treenode fullpath="' + escape(fullPath) + '" entrypath="' + escape(( (tObj.is_config) ? tObj.config_loc : entryPath )) + '" value="' + tValue + '" contentindex="' + (tObj.content_index) + '" icon="' + ( (tObj.isFolder) ? "1" : "2" ) + '"';
		if (tObj.children.length) {
			retHTML += ' state="expanded">';
			for (var n=0; n<tObj.children.length; n++) {
				var dataPath = String(tObj.children[n].toLowerCase());
				if (!includedPaths[dataPath] && includedPaths[this.get_trailing_slash(dataPath)]) dataPath = this.get_trailing_slash(dataPath);
				if (!includedPaths[dataPath] && includedPaths[this.trim_trailing_slash(dataPath)]) dataPath = this.trim_trailing_slash(dataPath);
				if (!includedPaths[dataPath]) {
					var tempPath = String(tObj.children[n]);
					if (tempPath.toLowerCase().indexOf(subRoot.toLowerCase()) == 0) {
						tempPath = this.sub_root_param + this.get_LS_file_insubroot(tempPath, subRoot);
					}
					var retObj = this.get_tree_html_recursive(subRoot, tObj.children[n], tempPath, treeData, includedPaths, false);
					if (treeData[tObj.children[n].toLowerCase()] && treeData[tObj.children[n].toLowerCase()].isFolder) {
						folderHTML += retObj.html;
					}
					else {
						fileHTML += retObj.html;
					}
					includedPaths = retObj.includedPaths;
				}
			}
		}
		else retHTML += ">";
		retHTML += folderHTML + fileHTML + "</mm:treenode>";
		return { html: retHTML, includedPaths: includedPaths };
	},

	get_local_structures: function() {
		var loadFolder = this.get_local_folder();
		var installFolder = dw.getConfigurationPath("/Shared/Dinamico/Presets/_install.txt");
		//check for installation files and copy them over to user directory if need-be
		installFolder = installFolder.substring(0, installFolder.lastIndexOf("/") + 1);
		var loadFiles = DWfile.listFolder(loadFolder, "files");
		if (!loadFiles.length) {
			loadFiles = DWfile.listFolder(installFolder + "*.xml", "files");
			for (var n=0; n<loadFiles.length; n++) {
				DWfile.copy(installFolder + loadFiles[n], loadFolder + loadFiles[n]);
			}
		}
	},
	
	get_local_folder: function() {
		var loadFolder = dw.getTempFolderPath();
		if (loadFolder.charAt(loadFolder.length-1) == "/") loadFolder = loadFolder.substring(0, loadFolder.lastIndexOf("/")); //remove trailing slash if exists
		loadFolder = loadFolder.substring(0, loadFolder.lastIndexOf("/") + 1) + "Shared/";//remove temp folder from path and add on shared folder path
		if (!DWfile.exists(loadFolder)) DWfile.createFolder(loadFolder);
		loadFolder += "Dinamico/";
		if (!DWfile.exists(loadFolder)) DWfile.createFolder(loadFolder);
		loadFolder += "Presets/";
		if (!DWfile.exists(loadFolder)) DWfile.createFolder(loadFolder);
		this.structures_folder = loadFolder;
		return loadFolder;
	},

	is_used_structure: function(tName) {
		var testFileName = this.strip_for_file_name(tName).toLowerCase();
		if (this.structure_names[tName.toLowerCase()]) return true;//structure name exactly (lowercase)
		if (this.structure_file_names[testFileName]) return true;//structure file name alike
		if (tName.toLowerCase() == dw.loadString("Dinamico/Presets/Custom").toLowerCase()) return true;//custom options
		if (testFileName == this.strip_for_file_name(dw.loadString("Dinamico/Presets/Custom").toLowerCase())) return true;
		if (tName.toLowerCase() == this.preset_order_list[0].toLowerCase()) return true;//blank base option
		if (tName.toLowerCase() == dw.loadString("Dinamico/Presets/Blank_Encoded").toLowerCase()) return true;//blank text options
		if (tName.toLowerCase() == dw.loadString("Dinamico/Presets/Blank").toLowerCase()) return true;
		if (testFileName == this.strip_for_file_name(dw.loadString("Dinamico/Presets/Blank_Encoded").toLowerCase())) return true;
		if (testFileName == this.strip_for_file_name(dw.loadString("Dinamico/Presets/Blank").toLowerCase())) return true;
		return false;
	},
	
	get_valid_preset_name: function(newPreset) {
		var tempName = String(newPreset.name);
		if (this.is_used_structure(tempName)) {
			tempName += " ";
			tCounter = 2;
			while (this.is_used_structure(tempName + String(tCounter))) tCounter++;
			tempName += String(tCounter);
		}
		newPreset.name = tempName;
		return newPreset;
	},
	
	
	import_structure: function(tPresetConfig) {
		//he proper syntax is menuEntryText|.xxx[;.yyy;.zzz]|CCCC|, where menuEntryText is the name of the file type to appear. The extensions can be specified as .xxx[;.yyy;.zzz] or CCCC, where .xxx specifies the file extension for the file type (optionally, .yyy and .zzz specify multiple file extensions) and CCCC is the four-character file type constant for the Macintosh
		var tPresetFile = dw.browseForFileURL("select", dw.loadString("Dinamico/Main/Browse/Import"), false, true, ['CONFIG (*.config), XML (*.xml)|*.xml;*.config|TEXT']);
		if (tPresetFile && DWfile.exists(tPresetFile)) {
			if (tPresetFile.search(MM.dinamico.file_path_pattern) != 0) {
				tPresetFile = dwscripts.getAbsoluteURL(tPresetFile, dw.getDocumentDOM().URL);
			}
			if (tPresetFile.search(/\.xml$/i) < 0) {
				var tPreset = MM.dinamico.read_config_file(tPresetFile);
				tPreset.name = dw.loadString("Dinamico/Presets/Imported");
			}
			else {
				var tPreset = MM.dinamico.load_structure({ xml: DWfile.read(tPresetFile) });
			}
			if (tPreset) {
				if (!tPreset.name) {
					tPreset.name = dw.loadString("Dinamico/Presets/Imported");
				}
				tPreset = this.get_valid_preset_name(tPreset);
				return this.save_structure_object({ preset: tPreset });
			}
		}
		return false;
	},
	
	save_structure_object: function(params) {
		if (!params) params = {};
		var opts = {
			preset: params.preset,
			name: params.name || params.preset.name,
			folder: params.folder || "",
			file_name: params.file_name || this.strip_for_file_name(params.name || params.preset.name) + ".xml",
		}
		return this.save_structure_xml(opts);
	},
	
	generate_structure_xml: function(params) {
		if (!params) params = {};
		var opts = {
			preset: params.preset,
			name: params.name || params.preset.name,
			folder: params.folder || "",
			file_name: params.file_name || this.strip_for_file_name(params.name || params.preset.name) + ".xml",
		}
		var tXML = '<?xml version="1.0" encoding="utf-8"?>' + this.line_break +
					'<' + this.xml.main + ' name="' + this.encode_for_html_name(opts.name) + '" subroot="' + escape(params.preset.subroot) + '" version="1.0">' + this.line_break +
					'	<' + this.xml.entries + '>' + this.line_break;
		for (var n=0; n<opts.preset.contents_object.length; n++) {
			tXML += '		<' + this.xml.entry + ' type="' + ( (opts.preset.contents_object[n].isFolder) ? "folder" : "file" ) + '"' +
							' name="' + escape(opts.preset.contents_object[n].name) + '"' +
							( (opts.preset.contents_object[n].isFolder && opts.preset.contents_object[n].extensions && opts.preset.contents_object[n].extensions.length) ? ' extensions="' + escape(opts.preset.contents_object[n].extensions.join("")) + '"' : "" ) +
							( (opts.preset.contents_object[n].isScanned) ? ' scan="on"' : '' ) +
							( (opts.preset.contents_object[n].isFolder && opts.preset.contents_object[n].isRecursive) ? ' recursive="recursive"' : '' ) +
							( (opts.preset.contents_object[n].filter) ? ' filter="' + escape(opts.preset.contents_object[n].filter) + '"' : "" ) +
							'></' + this.xml.entry + '>' + this.line_break;
		}
		tXML += '	</' + this.xml.entries + '>' + this.line_break + '</' + this.xml.main + '>';
		return tXML;
	},
	
	save_structure_xml: function(params) {
		if (!params) params = {};
		var opts = {
			preset: params.preset,
			name: params.name || params.preset.name,
			folder: params.folder || "",
			file_name: params.file_name || this.strip_for_file_name(params.name || params.preset.name) + ".xml",
		}
		var tXML = this.generate_structure_xml(opts);
		if (!opts.folder) {
			opts.folder = this.structures_folder;
		}
		DWfile.write(opts.folder + opts.file_name, tXML);
		return {
			name: opts.name,
			file_name: opts.file_name,
			folder: opts.folder
		};
	},
	
	remove_structure: function(tIndex) {
		var tArr = [];
		for (var n=0; n<this.structure_objects.length; n++) {
			if (n != tIndex) {
				tArr.push(this.structure_objects[n]);
			}
			else {
				DWfile.remove(this.structures_folder + this.strip_for_file_name(this.structure_objects[n].name) + ".xml");
			}
		}
		this.structure_objects = tArr;
		this.structure_names = {};
		this.structure_file_names = {};
		for (var n=0; n<this.structure_objects.length; n++) {
			this.structure_names[this.structure_objects[n].name.toLowerCase()] = this.structure_objects[n];
			this.structure_file_names[this.strip_for_file_name(this.structure_objects[n].name).toLowerCase()] = this.structure_objects[n];
		}
		return true;
	},
	
	encode_for_html_name: function(tStr) {
		//begin with encoding only ampersands that aren't followed by a letter-number code
		var tInd = tStr.search(/\&/);
		if (tInd >= 0) {
			var tempStr = String(tStr);
			var tempStr_out = "";
			while (tInd >= 0) {
				tempStr_out += tempStr.substring(0, tInd);
				tempStr = tempStr.substring(tInd);
				if (tempStr.search(/\&\w+;/) == 0) {
					var tMatch = tempStr.match(/\&\w+;/);
					tempStr_out += tMatch[0];
					tempStr = tempStr.substring(tMatch[0].length);
				}
				else {
					tempStr = tempStr.substring(1);
					tempStr_out += "&amp;";
				}
				tInd = tempStr.search(/\&/);
			}
			tempStr_out += tempStr;
			tStr = tempStr_out;
		}
		//strip quotes
		if (tStr.search(/"/) >= 0) {
			tStr = tStr.replace(/"/g, "&quot;");
		}
		//strip lt sign
		if (tStr.search(/</) >= 0) {
			tStr = tStr.replace(/</g, "&lt;");
		}
		//strip gt sign
		if (tStr.search(/>/) >= 0) {
			tStr = tStr.replace(/>/g, "&gt;");
		}
		return tStr;
	},
	
	strip_for_file_name: function(tStr) {
		return this.encode_for_html_name(tStr).replace(/[^\w\d]*/g, "").replace(/\s*/g, "");
	},
	
	create_config_file: function(tPreset) {
		var configStr = this.generate_config_file(tPreset);
		var siteRoot = this.get_site_root(true);
		DWfile.write(siteRoot + this.site_file_name, configStr);
		this.set_notes_from_preset(siteRoot + this.site_file_name, tPreset);
		site.refresh("local");
	},
	generate_config_file: function(tPreset) {
		var tRoot = String(tPreset.subroot);
		var configStr = "";
		for (var n=0; n<tPreset.contents_object.length; n++) {
			var tPath = String(tPreset.contents_object[n].name);
			if (tPath.search(this.config_pattern) == 0) {
				tPath = tPath.replace(this.config_pattern, "/").replace(/^\/*/, "/");
				tPath = this.get_location_system_path(this.get_config_path(tPath));
			}
			else if (tPath.search(this.sub_root_pattern) == 0) {
				tPath = tPath.replace(this.sub_root_pattern, "").replace(/^\/*/, "");
				tPath = this.get_trailing_slash(tRoot) + tPath;
			}
			if (tPath.search(this.file_path_pattern) == 0) {
				tPath = this.get_location_system_path(tPath);
			}
			if (tPath.indexOf('"') >= 0 || tPath.search(/\s/) >= 0) {
				tPath = '"' + tPath.replace(/"/g, '""') + '"';
			}
			var extStr = ( (tPreset.contents_object[n].isFolder) ? tPreset.contents_object[n].extensions.join("") : "" );
			if (extStr) extStr = " EXTENSIONS(" + extStr + ")";
			var filterStr = ( (tPreset.contents_object[n].filter) ? " " + tPreset.contents_object[n].filter : "" );
			configStr += ( (tPreset.contents_object[n].isScanned) ? "" : "# " );
			configStr += ( (tPreset.contents_object[n].isFolder && tPreset.contents_object[n].isRecursive) ? "+ " : "" );
			configStr += tPath + extStr + filterStr + this.line_break ;//( (n!=tPreset.contents_object.length-1) ? this.line_break : "" );
		}
		return configStr;
	},
	
	browse_folder: function(params) {
		if (!params) params = {};
		var opts = {
			folder: params.folder || "",
			label: params.label || dw.loadString("Dinamico/Browse/SelectFolder"),
			new_path: "",
		}
		opts.new_path = dw.browseForFolderURL(opts.label, opts.folder);
		return opts.new_path;
	},
	
	browse_file_folder: function(params) {
		if (!params) params = {};
		var opts = {
			type: params.type || "file",//"file" "folder"
			text_elm: params.element || false,
			preset_obj: params.preset_obj,
			old_path: params.old_path || "",
			old_location: params.old_location || "",
			new_path: "",
			new_location: "",
		}
		if (!opts.text_elm) return false;
		var rootPath = this.get_subroot_filepath(opts.preset_obj.subroot);
		rootPath = this.get_trailing_slash(rootPath);
		if (opts.type == "file") {
			opts.new_path = dw.browseForFileURL("select", dw.loadString("Dinamico/Browse/SelectFile"), false, true);
			if (opts.new_path && opts.new_path.search(/file\:\/\/\//i) < 0 && dw.getDocumentDOM() && dw.getDocumentDOM().URL) {
				opts.new_path = dwscripts.getAbsoluteURL(opts.new_path, dw.getDocumentDOM().URL);
			}
		}
		else {
			opts.isFolder = true;
			opts.new_path = this.browse_folder({ folder: rootPath });
		}
		if (!opts.new_path) return false;
		return this.get_new_path({
			type: opts.type,
			preset_obj: opts.preset_obj,
			new_path: opts.new_path,
			new_value: "",
			new_location: "",
			old_path: opts.old_path || "",
			old_location: opts.old_location || "",
			isFolder: (opts.type == "folder"),
		});
	},
	
	get_new_path: function(params) {
		if (!params) params = {};
		var opts = {
			type: params.type || "entered",
			preset_obj: params.preset_obj,
			new_path: params.new_path,
			new_location: params.new_location || "",
			new_value: params.new_value || "",
			old_path: params.old_path || "",
			old_location: params.old_location || "",
			isFolder: params.isFolder || false,
		}
		var siteRoot = this.get_site_root(true);
		var rootPath = this.get_subroot_filepath(opts.preset_obj.subroot);
		rootPath = this.get_trailing_slash(rootPath);
		var rootInSite = (rootPath.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0 && true);
		var testPath = this.get_trailing_slash(opts.new_path);
		if (opts.old_location) {
			opts.old_location = this.trim_trailing_slash(opts.old_location);
			if (opts.old_location.toLowerCase() == this.trim_trailing_slash(rootPath).toLowerCase()) {
				opts.old_location = this.get_trailing_slash(opts.old_location);
				opts.old_path = this.get_trailing_slash(opts.old_path);
			}
			if (opts.old_location.toLowerCase().indexOf(rootPath.toLowerCase()) == 0) {
				opts.old_location = this.sub_root_param + opts.old_location.substring(rootPath.length);
			}
			else {
				opts.old_location = this.get_location_system_path(opts.old_location);
			}
		}
		if (!opts.new_path) {
			opts.isFolder = true;
			opts.new_path = String(rootPath);
		}
		if (opts.new_path.search(this.file_path_pattern) != 0) {
			if (opts.new_path.charAt(0) == "/") {
				opts.new_path = rootPath + opts.new_path.substring(1);
			}
			else {
				opts.new_path = rootPath + opts.new_path;
			}
		}
		if (!opts.isFolder && opts.type != "file") {
			var testPath = this.trim_trailing_slash(opts.new_path);
			//opts.isFolder = (opts.new_path.charAt(opts.new_path.length-1) == "/");
			//if (!opts.isFolder) {
				var foldToCheck = testPath.substring(0, testPath.lastIndexOf("/") + 1);
				var nameToCheck = testPath.substring(foldToCheck.length).toLowerCase();
				if (!foldToCheck || !nameToCheck || foldToCheck.toLowerCase() == "file:///") opts.isFolder = true;
				if (DWfile.exists(foldToCheck)) {
					var foldContents = DWfile.listFolder(foldToCheck, "directories");
					if (foldContents && foldContents.length) {
						for (var n=0; n<foldContents.length; n++) {
							if (foldContents[n].toLowerCase() == nameToCheck) {
								opts.isFolder = true;
								break;
							}
						}
					}
				}
			//}
		}
		var configRetObj = this.check_is_config(opts);
		if (configRetObj && configRetObj.is_config) {
			opts.new_location = this.trim_trailing_slash(configRetObj.new_location);
			opts.new_path = this.trim_trailing_slash(configRetObj.new_path);
			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
				return false;
			}
		}
		if (opts.new_path.toLowerCase().indexOf(rootPath.toLowerCase()) == 0) {
			//is a root-path
			opts.new_location = String(this.sub_root_param) + this.trim_trailing_slash(this.get_LS_file_insubroot(opts.new_path, rootPath));
			opts.new_value = ("/" + opts.new_path.substring(rootPath.length)).replace(/^\/*/, "/");
			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
				return false;
			}
		}
//		else if (opts.new_path.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0) {
//			//not in root, but in site
//			opts.new_location = this.get_location_system_path(opts.new_path).replace(this.final_slash_pattern, "");
//			opts.new_value = String(opts.new_path);
//			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
//				return false;
//			}
//		}
		else {
			//not in root or site, alert if need be and return proper path
			opts.new_location = this.get_location_system_path(this.trim_trailing_slash(opts.new_path));
			opts.new_value = String(opts.new_path);
			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
				return false;
			}
		}
		return opts;
	},
	
	check_fold_or_file: function(params) {
		if (!params) params = {};
		var opts = {
			path: params.path,
			isFolder: params.isFolder || false,
		}
		//strip out final slash
		var testPath = this.trim_trailing_slash(opts.path);
		//opts.isFolder = (opts.new_path.charAt(opts.new_path.length-1) == "/");
		var foldToCheck = testPath.substring(0, testPath.lastIndexOf("/") + 1);
		var nameToCheck = testPath.substring(foldToCheck.length).toLowerCase();
		if (DWfile.exists(foldToCheck)) {
			var foldContents = DWfile.listFolder(foldToCheck, "directories");
			if (foldContents && foldContents.length) {
				for (var n=0; n<foldContents.length; n++) {
					if (foldContents[n].toLowerCase() == nameToCheck) {
						opts.isFolder = true;
						break;
					}
				}
			}
			var foldContents = DWfile.listFolder(foldToCheck, "files");
			if (foldContents && foldContents.length) {
				for (var n=0; n<foldContents.length; n++) {
					if (foldContents[n].toLowerCase() == nameToCheck) {
						opts.isFolder = false;
						break;
					}
				}
			}
		}
		return opts;
	},
	
	validate_new_path: function(params) {
		if (!params) params = {};
		var opts = {
			preset_obj: params.preset_obj,
			new_path: params.new_path,
			new_location: params.new_location || "",
			old_path: params.old_path || "",
			old_location: params.old_location || "",
		}
		if (opts.old_location) opts.old_location = this.trim_trailing_slash(opts.old_location);
		var siteRoot = this.get_site_root(true);
		var rootPath = this.get_subroot_filepath(opts.preset_obj.subroot);
		rootPath = this.get_trailing_slash(rootPath);
		var rootInSite = (rootPath.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0 && true);
		if (!opts.new_path) {
			opts.isFolder = true;
			opts.new_path = "/";
		}
		if (opts.new_path.search(this.file_path_pattern) != 0) {
			if (opts.new_path.charAt(0) == "/") {
				opts.new_path = rootPath + opts.new_path.substring(1);
			}
			else {
				opts.new_path = rootPath + opts.new_path;
			}
		}
		var moveToSiteRoot = (opts.new_path.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0 && !rootInSite);
		//root path must be updated if the new path is somewhere in the site root that does not include the root path
		if (!moveToSiteRoot && (opts.new_path.toLowerCase().indexOf(rootPath.toLowerCase()) == 0 || opts.new_path.toLowerCase() == this.trim_trailing_slash(rootPath).toLowerCase())) {
			if (opts.new_path.toLowerCase() == this.trim_trailing_slash(rootPath).toLowerCase()) {
				opts.new_path = this.get_trailing_slash(opts.new_path);
			}
			//is a root-path
			opts.new_location = String(this.sub_root_param) + "/" + this.trim_trailing_slash(opts.new_path.substring(rootPath.length));
			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
				return "*nochange*";
			}
		}
		else if (opts.new_path.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0 || opts.new_path.toLowerCase() == this.trim_trailing_slash(siteRoot).toLowerCase()) {
			if (opts.new_path.toLowerCase() == this.trim_trailing_slash(siteRoot).toLowerCase()) {
				opts.new_path = this.get_trailing_slash(opts.new_path);
			}
			//not in root, but in site
			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
				return "*nochange*";
			}
		}
		else {
			//not in root or site, alert if need be and return proper path
			opts.new_location = this.get_location_system_path(this.trim_trailing_slash(opts.new_path));
			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
				return "*nochange*";
			}
			if (!this.selected_info.has_alerted_outside) {
				alert(dw.loadString("Dinamico/Alert/File_outside"));
				this.selected_info.has_alerted_outside = true;
				MM.dinamico_has_alerted_outside = true;
			}
		}
		//check to see that the new location isn't already used
		for (var n=0; n<opts.preset_obj.contents_object.length; n++) {
			if (opts.preset_obj.contents_object[n].name.toLowerCase() == opts.new_location.toLowerCase() && 
				(!opts.old_location || opts.preset_obj.contents_object[n].name.toLowerCase() != opts.old_location.toLowerCase())) {
				//same location already exists in preset
				return dw.loadString("Dinamico/Alert/New_Used");
			}
		}
		return "";
	},
	
	do_path_update: function(params) {
		if (!params) params = {};
		var opts = {
			type: params.type || "entered",
			preset_obj: params.preset_obj,
			new_path: params.new_path,
			new_location: params.new_location || "",
			old_path: params.old_path || "",
			old_location: params.old_location || "",
			isFolder: params.isFolder || false,
			updated_preset: false,
		}
		if (opts.old_location) opts.old_location = this.trim_trailing_slash(opts.old_location);
		var siteRoot = this.get_site_root(true);
		var rootPath = this.get_subroot_filepath(opts.preset_obj.subroot);
		rootPath = this.get_trailing_slash(rootPath);
		var rootInSite = (rootPath.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0 && true);
		if (!opts.new_path) {
			opts.isFolder = true;
			opts.new_path = "/";
		}
		if (opts.new_path.search(this.file_path_pattern) != 0) {
			if (opts.new_path.charAt(0) == "/") {
				opts.new_path = rootPath + opts.new_path.substring(1);
			}
			else {
				opts.new_path = rootPath + opts.new_path;
			}
		}
		if (!opts.isFolder && opts.type != "file") {
			opts.isFolder = (opts.new_path.charAt(opts.new_path.length-1) == "/");
			if (!opts.isFolder) {
				var foldToCheck = opts.new_path.substring(0, opts.new_path.lastIndexOf("/") + 1);
				var nameToCheck = opts.new_path.substring(foldToCheck.length).toLowerCase();
				if (DWfile.exists(foldToCheck)) {
					var foldContents = DWfile.listFolder(foldToCheck, "directories");
					if (foldContents && foldContents.length) {
						for (var n=0; n<foldContents.length; n++) {
							if (foldContents[n].toLowerCase() == nameToCheck) {
								opts.isFolder = true;
								break;
							}
						}
					}
				}
			}
		}
		var moveToSiteRoot = (opts.new_path.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0 && !rootInSite);
		//root path must be updated if the new path is somewhere in the site root that does not include the root path
		var isConfigRet = this.check_is_config(opts);
		if (isConfigRet && isConfigRet.is_config) {
			opts.new_location = String(isConfigRet.new_location);
			opts.new_path = String(isConfigRet.new_path);
			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
				return false;
			}
		}
		if (!moveToSiteRoot && (opts.new_path.toLowerCase().indexOf(rootPath.toLowerCase()) == 0 || opts.new_path.toLowerCase() == this.trim_trailing_slash(rootPath).toLowerCase())) {
			if (opts.new_path.toLowerCase() == this.trim_trailing_slash(rootPath).toLowerCase()) {
				opts.new_path = this.get_trailing_slash(opts.new_path);
				opts.isFolder = true;
			}
			//is a root-path
			opts.new_location = String(this.sub_root_param) + this.trim_trailing_slash(this.get_LS_file_insubroot(opts.new_path, rootPath));
			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
				return false;
			}
		}
		else if (opts.new_path.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0 || opts.new_path.toLowerCase() == this.trim_trailing_slash(siteRoot).toLowerCase()) {
			if (opts.new_path.toLowerCase() == this.trim_trailing_slash(siteRoot).toLowerCase()) {
				opts.new_path = this.get_trailing_slash(opts.new_path);
				opts.isFolder = true;
			}
			//not in root, but in site
			var tempLoc = String(this.sub_root_param) + this.trim_trailing_slash((this.get_LS_file_insubroot(opts.new_path, siteRoot)));
			if (opts.old_location && opts.old_location.toLowerCase() == tempLoc.toLowerCase()) {
				return false;
			}
			if (confirm(dw.loadString("Dinamico/Confirm/File_outside_insite"))) {
				opts.new_location = tempLoc;
				for (var n=0; n<opts.preset_obj.contents_object.length; n++) {
					if (opts.preset_obj.contents_object[n].name.search(this.sub_root_pattern) == 0 && 
						(!opts.old_location || opts.preset_obj.contents_object[n].name.toLowerCase() != opts.old_location.toLowerCase())) {
						//not the presently updating location but in subrootstyle location
						var newName = rootPath + ( opts.preset_obj.contents_object[n].name.replace(this.sub_root_pattern, "").replace(/^\/*/, "") );
						if (rootInSite) {
							//update the subroot to the site root for the preset and update all file locations to new root path
							newName = String(this.sub_root_param) + ("/" + newName.substring(siteRoot.length)).replace(/^\/*/, "/");
						}
						else {
							//update the subroot to the site root for the preset and update all existing file locations to the full path-style location
							newName = this.get_location_system_path(newName);
						}
						opts.preset_obj.contents_object[n].name = newName;
					}
				}
				opts.preset_obj.subroot = String(this.site_root_param) + "/";
				opts.updated_preset = true;
			}
			else {
				opts.new_location = this.get_location_system_path(this.trim_trailing_slash(opts.new_path));
				if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
					return false;
				}
			}
		}
		else {
			//not in root or site, alert if need be and return proper path
			opts.new_location = this.get_location_system_path(this.trim_trailing_slash(opts.new_path));
			if (opts.old_location && opts.old_location.toLowerCase() == opts.new_location.toLowerCase()) {
				return false;
			}
		}
		return opts;
	},
	
	get_LS_file_insubroot: function(tPath, rootPath) {
		var testPath = this.get_trailing_slash(tPath);
		var testRoot = this.get_trailing_slash(rootPath);
		var trimRoot = this.trim_trailing_slash(rootPath);
		var retPath = String(tPath);
		if (retPath.search(this.sub_root_pattern) == 0) {
			retPath = ("/" + retPath.replace(this.sub_root_pattern, "")).replace(/^\/*/, "/");
		}
		else if (testPath.toLowerCase().indexOf(testRoot.toLowerCase()) == 0) {
			retPath = retPath.substring(trimRoot.length);
		}
		return retPath;
	},
	
	updated_subroot: function(tPreset, newRoot) {
		//update those scans that used to be outside the subroot, but now are within
		for (var n=0; n<tPreset.contents_object.length; n++) {
			if (tPreset.contents_object[n].name.toLowerCase().indexOf(newRoot.toLowerCase()) == 0) {
				tPreset.contents_object[n].name = String(this.sub_root_param) + this.get_LS_file_insubroot(tPreset.contents_object[n].name, newRoot);
			}
		}
		//ensure the site root is not in the subroot, update if needed
		var siteRoot = this.get_site_root(true);
		if (newRoot.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0) {
			newRoot = this.site_root_param + this.get_LS_file_insubroot(newRoot, siteRoot);
		}
		tPreset.subroot = newRoot;
		return tPreset;
	},
	
	get_location_system_path: function(tFilePath) {
		var sysPath = MMNotes.localURLToFilePath(tFilePath);
		if (this.is_mac()) {
			sysPath = sysPath.replace(/\:/g, "/");
			if (sysPath.charAt(0) != "/") {
				sysPath = "/" + sysPath;
			}
			//sysPath = sysPath.substring(sysPath.indexOf("/"));
			if (sysPath.search(/^\/volumes\//i) != 0) {
				sysPath = "/Volumes" + sysPath;
			}
		}
		else {
			sysPath = sysPath.replace(/\\/g, "/");
		}
		return sysPath;
	},
	
	get_file_path_from_system: function(tSysPath) {
		var filePath = tSysPath;
		if (filePath.search(this.file_path_pattern) == 0) {
			return filePath;
		}
		if (this.is_mac()) {
			filePath = filePath.replace(/^\/?Volumes\//i, "");
			filePath = filePath.replace(/\//g, ":");
			//if (filePath.charAt(0) == ":") {
			//	rootFolder = dw.getTempFolderPath();
			//	rootFolder = rootFolder.replace(this.file_path_pattern, "");
			//	rootFolder = rootFolder.substring(0, rootFolder.indexOf("/"));
			//	filePath = rootFolder + filePath;
			//}
		}
		else {
			filePath = filePath.replace(/\//g, "\\");
		}
		return MMNotes.filePathToLocalURL(filePath);
	},
	
	remove_mac_volumes: false,
	remove_mac_leadingslash: false,
	
	set_editing_system_path: function(tPath, tRoot, forceTrailingSlash) {
		var retPath = String(tPath);
		tRoot = this.get_trailing_slash(tRoot);
		if (tPath.search(this.file_path_pattern) != 0) {
			var siteRoot = this.get_site_root(true);
			if (retPath.search(this.sub_root_pattern) == 0) {
				var tempPath = retPath.replace(this.sub_root_pattern, "");
				tempPath = tempPath.replace(/^\/*/, "");
				retPath = tRoot + tempPath;
			}
			if (retPath.search(this.site_root_pattern) == 0) {
				var tempPath = retPath.replace(this.site_root_pattern, "");
				tempPath = tempPath.replace(/^\/*/, "");
				retPath = siteRoot + tempPath;
			}
		}
		retPath = MMNotes.localURLToFilePath(( (forceTrailingSlash) ? this.get_trailing_slash(retPath) : retPath ));
		if (this.is_mac()) {
			retPath = retPath.replace(/\:/g, "/");
			//this.remove_mac_leadingslash = false;
			if (retPath.charAt(0) != "/") {
			//	this.remove_mac_leadingslash = true;
				retPath = "/" + retPath;
			}
			//this.remove_mac_volumes = false;
			if (retPath.search(/^\/volumes\//i) != 0) {
			//	this.remove_mac_volumes = true;
				retPath = "/Volumes" + retPath;
			}
		}
		return retPath;
	},
	
	get_trailing_slash: function(tPath) {
		return (tPath + "/").replace(this.final_slash_pattern, "/");
	},
	
	trim_trailing_slash: function(tPath) {
		return (tPath + "/").replace(this.final_slash_pattern, "");
	},
	
	
	//rootOption = 0 - leave as is (full file path)
	//rootOption = 1 - return with [SUBROOT]
	//rootOption = 2 - return with encoded root $(SITEROOT)...
	//rootOption = 3 - return with removed root "/..."
	//rootOption = 4 - return with removed root "..."
	get_editing_system_path: function(tPath, tRoot, rootOption) {
		if (!rootOption) rootOption = 0;
		var retPath = String(tPath);
		if (this.is_mac()) {
			//if (this.remove_mac_volumes) {
				retPath = retPath.replace(/^\/volumes\//i, "");
			//}
			//if (this.remove_mac_leadingslash && retPath.charAt(0) == "/") {
			if (retPath.charAt(0) == "/") {
				retPath = retPath.substring(1);
			}
			retPath = retPath.replace(/\//g, ":");
		}
		retPath = MMNotes.filePathToLocalURL(retPath);
		tRoot = this.get_trailing_slash(tRoot);
		if (rootOption && retPath.toLowerCase().indexOf(tRoot.toLowerCase()) == 0) {
			switch (rootOption) {
				case "1":
					return this.sub_root_param + retPath.substring(tRoot.length)
				case "2":
					var siteRoot = this.get_site_root(true);
					if (tRoot.toLowerCase().indexOf(siteRoot.toLowerCase()) == 0) {
						return this.site_root_param + tRoot.substring(siteRoot.length);
					}
					break;
				case "3":
					return retPath.substring(tRoot.length);
				case "4":
					retPath = retPath.substring(tRoot.length);
					if (retPath.charAt(0) == "/") retPath = retPath.substring(1);
					break;
			}
		}
		return retPath;
	},
	
	prep_root_path: function(rootPath, oldPath, outsideAlerted, gettingOld) {
		if (!gettingOld) {
			var oldInfo = this.prep_root_path(oldPath, "", true, true);
		}
		else {
			var oldInfo = { root_path: "", ret_path: "" };
		}
		var siteURL = this.get_site_root(true);
		rootPath = this.get_trailing_slash(rootPath);
		var retPath = String(rootPath);
		if (rootPath.search(MM.dinamico.file_path_pattern) != 0) {
			if (retPath.search(this.site_root_pattern) == 0) {
				var tempPath = retPath.replace(this.site_root_pattern, "");
				tempPath = tempPath.replace(/^\/*/, "");
				retPath = siteURL + tempPath;
			}
			else {
				rootPath = siteURL + rootPath.replace(/^\/*/g, "");
			}
		}
		if (rootPath.toLowerCase().indexOf(siteURL.toLowerCase()) == 0) {
			retPath = this.site_root_param + ("/" + retPath.substring(siteURL.length)).replace(/^\/*/, "/");
			retPath = retPath.replace(siteURL, this.site_root_param);
		}
		else {
			retPath = this.get_location_system_path(retPath);
			if (rootPath && rootPath != oldInfo.root_path && oldInfo.ret_path != retPath && !outsideAlerted) {
				alert(dw.loadString("Dinamico/Alert/Subroot_outside"));
				outsideAlerted = true;
			}
		}
		return {
			root_path: rootPath,
			ret_path: retPath,
			outside_alerted: outsideAlerted,
			old_info: oldInfo,
		}
	},
}
}