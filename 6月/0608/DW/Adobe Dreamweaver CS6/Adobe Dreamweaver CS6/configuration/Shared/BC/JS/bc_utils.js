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

if (!MM.BC.UTILS) MM.BC.UTILS = {

	RelatedFiles : {},
	/**
	 * Check if 2 objects have a specific property defined
	 *
	 * @param Object The first object
	 * @param Object The second object
	 * @return Boolean false, true
	 */
	hasProperty : function(a, b, property) {
		if (!a || !b || !a.hasOwnProperty(property + "") || !b.hasOwnProperty(property + "")) return false;
		return true;
	},
	/**
	 * Sorts based on the a specific property
	 *
	 * @param Object The first object
	 * @param Object The second object
	 * @param Object The property to sort on
	 * @return Number 1, 0 or -1
	 */
	sortBy : function(a, b, property) {
		if (!MM.BC.UTILS.hasProperty(a, b, property)) return 0;
		if (a[property] > b[property]) {
			return 1;
		} else {
			if (a[property] < b[property]) {
				return -1;
			}
		}
		return 0;
	},
	
	/**
	 * Sorts based on the token property
	 *
	 * @param Object The first object
	 * @param Object The second object
	 * @return Number 1, 0 or -1
	 */	
	sortByToken : function(a, b) {
		return MM.BC.UTILS.sortBy(a, b, "token");
	},
	
	/**
	 * Sorts based on the order property
	 *
	 * @param Object The first object
	 * @param Object The second object
	 * @return Number 1, 0 or -1
	 */	
	
	sortByOrder : function(a, b) {
		return MM.BC.UTILS.sortBy(a, b, "order");
	},
	
	/**
	 * Sorts based on the name property
	 *
	 * @param Object The first object
	 * @param Object The second object
	 * @return Number 1, 0 or -1
	 */	
	
	sortByName : function (a, b) {
		return MM.BC.UTILS.sortBy(a, b, "name");
	},
	
	/**
	 * Sorts based on the priority property
	 *
	 * @param Object The first object
	 * @param Object The second object
	 * @return Number The difference between the first priority and the second priority
	 */	
	sortByPriority : function(a, b) {
		return MM.BC.UTILS.sortBy(a, b, "priority");
	},
	
	/**
	 * Finds and entity into an array by the name property
	 *
	 * @param Array The array of entities
	 * @param String The name
	 * @return Object The object with the given name or null
	 */		
	findEntityByName : function(entities, name) {
		if (!entities) return null;
		var entity;
		for (var i = 0; i < entities.length; i++) {
			entity = entities[i];
			if (entity.name == name) {
				return entity;
			}
		}
		return null;
	},
	
	/**
	 * Gets an object containing information abount the DW environment
	 *
	 * @return Object An object containing the version, panel color and locale info
	 */		
	getDWInfo : function() {
		var appInfo = new Object();
		appInfo.version = dw.appVersion;
		appInfo.panelColor = dw.getPanelColor();
		appInfo.locale = dw.getAppLanguage();
		
		return appInfo;
	},
	
	/**
	 * Generates a BC URL by replacing some placeholders with the corresponding data
	 *
	 * @param String The initial URL 
	 * @param String A one time token to be used for the call
	 * @param String The current DW selecton (in some cases this is passed inside the URL)
	 * @return String The final URL
	 */	
	generateURL : function(url, oneTimeToken, selection) {
		var dwInfo = MM.BC.UTILS.getDWInfo();
		
		var properties = {
			"siteAuthToken": function() {return oneTimeToken;},
			"app": function() {return 'dw';},
			"lang": function() {return dwInfo.locale;},
			"dwVersion": function() {return dwInfo.version;},
			"dwColor": function() {return dwInfo.panelColor;},
			"selection": function() {return selection;}
		};
		
		for (var property in properties) {
			var value = properties[property]();
			url = url.replace('@@' + property + '@@', function(str) {
				return encodeURI(value);
			});
			
			url = url.replace('%40%40' + property +'%40%40', function(str) {
				return encodeURI(encodeURI(value));
			});
		}
		
		return url;
	},
	
	/**
	 * Logs a message to the DW site reports panel
	 *
	 * @param String The message to log
	 */		
	logMessage : function(message) {
		//reportItem("MM.BC", 'BusinessCatalyst.js', message);
	},
	
	/**
	 * Trims a string
	 *
	 * @param String String to trim
	 * @return String The trimmed string
	 */		
	trim : function(str) {
		return str ? str.replace(/^\s*/gi, '').replace(/\s*$/gi, '') : str;
	},
	
	/**
	 * Inserts a script tag in the page that is loaded in the MMBrowser
	 *
	 * @param String The ID of the script tag
	 * @param String The code to be added in the script tag
	 * @param Object The browser window object
	 */		
	injectScript : function (id, script, browserWin) {
		var doc = browserWin.document;
		var js = doc.createElement('script');
		js.setAttribute('id', id);
		js.innerHTML = script;
		
		var html = doc.documentElement;
		html.insertBefore(js, html.firstChild);
	},
	
	/**
	 * Removes a script tag in the page that is loaded in the MMBrowser
	 *
	 * @param String The ID of the script tag
	 * @param Object The browser window object
	 */		
	removeScript : function (id, browserWin) {
		var doc = browserWin.document
		var js = doc.getElementById(id);
		if (js) {
			js.parentNode.removeChild(js);
		}
	},

	/**
	 * Returns the BC dedicated folder in the DW Configuration folder 
	 *
	 * @return String The path to the BC folder
	 */	
	getBusinessCatalystDWFolder : function() {
		var path = MM.BC.getConfigurationPath();
		path += "/";
		path = path.replace( /\/\/$/gi, "/" );

		path += "Shared/BC/";

		return path;
	},
	
	/**
	 * Escapes a string to be used in HTML
	 *
	 * @return String The escaped string
	 */		
	escapeHTMLString : function ( str ) {
		if (!str) return str;
		
		var newStr = str;
		
		newStr = newStr.replace(/&/gi, "&amp;" );
		newStr = newStr.replace(/</gi, "&lt;" );
		newStr = newStr.replace(/>/gi, "&gt;" );
		
		return newStr;
	},
	
	/**
	 * Replaces the current selection with the given code
	 *
	 * @param String The code to insert
	 */
	replaceSelectionWithCode: function( code ) {
		var dom = dw.getDocumentDOM();
		var selectedNode = dom.getSelectedNode();
		var docElement = dom.documentElement;
		var allText = docElement.outerHTML;
		var lockOffsets = dom.nodeToOffsets( selectedNode );
		var allText = allText.substring( 0, lockOffsets[0] ) + code + allText.substring( lockOffsets[1] );
		docElement.outerHTML = allText;

		// reset selection
		dom.setSelection( lockOffsets[0], lockOffsets[0] + code.length );
	},

	/**
	 * Gets the body contents for a given DOM
	 *
	 * @param Object The DOM
	 * @return String The innerHTML of the body
	 */
	getContentFromDom: function( dom ) {
		var bodyNodes = dom.documentElement.getElementsByTagName( "body" );
		
		if ( !bodyNodes || !bodyNodes.length) {
			return "";
		}

		var content = bodyNodes[ 0 ].innerHTML;
		
		var bRegionsExp = /<!--\s*(Template|Instance)BeginEditable[^>]*-->/gi;
		var eRegionsExp = /<!--\s*(Template|Instance)EndEditable[^>]*-->/gi;
			
		content = content.replace(bRegionsExp, '').replace(eRegionsExp, '');

		return content;
	},

	/** 
	 * Retrieves the site URLs for a given site no
	 *
	 * @param Number siteNo The DW site number
	 * @return Array of String The site URLs, or empty array if none was found
	 */
	getFileURIFromSiteAbsolutePath: function( path ) {
		var siteRootURI = dw.getSiteRoot().replace( /\/$/gi, "" );
		return siteRootURI + path;
	},
	
	/**
	 * Gets the full URL for a relative link in a page
	 *
	 * @param String Relative URL to the linked page
	 * @param String The URL of the current page
	 * @param String The site root path
	 * @return String The absolute URL to the linked page
	 */	
	getFullPath: function(path, activeURL, siteRoot) {
		var fullPath = "";
		
		if (!path) return "";
		
		try {
			if (path.match(/^\//gi)) {
				fullPath = (siteRoot ? siteRoot : dw.getSiteRoot()).replace(/\/$/gi, '') + path;
			} else {
				fullPath = dw.relativeToAbsoluteURL(activeURL, "", path);
			}
		} catch (e) {
		}
		
		return fullPath;
	},
	
	/**
	 * Retrieves the content of a dependent file
	 *
	 * @param String The file URI
	 * @param String The default content to return if the file does not exist
	 * @return String The content of the file or the default content (if the file does not exist)
	 */
	getExtenalFileContent: function( depFile, defaultContent, docUrl ) {
		var depFileURI = depFile;
		var depFileDom = null;
		
		if (depFileURI && !DWfile.exists( depFileURI ) ) {
			depFileURI = MM.BC.UTILS.getFileURIFromSiteAbsolutePath( depFile );
		}
		
		if ( !DWfile.exists( depFileURI ) ) {
			return defaultContent;
		} else {
			// recursive inclusion//
			if (depFileURI == docUrl) return defaultContent;
		}

		// During edit, if the file is also marked as dependent file, the DOM is somehow cached, so we prefer to read it from the disk
		var content = DWfile.read( depFileURI );
		
		// if its a folder//
		if (content == null) return defaultContent;
		
		depFileDom = dw.getNewDocumentDOM();
		depFileDom.documentElement.outerHTML = content;

		var content = MM.BC.UTILS.getContentFromDom( depFileDom );

		return content;
	},
	
	
	/**
	 * Retrieves the site URLs for a given site no
	 *
	 * @param Number siteNo The DW site number
	 * @return Array of String The site URLs, or empty array if none was found
	 */
	getSiteUrls : function( DWSiteName ) {

		function getSiteNumberForSite(siteName) {
			function getTotalNumberOfSites() {
				return dw.getPreferenceInt("Sites\\-Summary", "Number of Sites", -1);
			};

			var currentSiteNumber = -1;

			if (siteName !== "") {
				var noOfSites = getTotalNumberOfSites();
				if (noOfSites > 0) {
					var counter = 0;
					var tempSiteName;

					// We'll test only first 500 sites to make sure we eventually get out of this while
					while ((counter < 500) && (noOfSites >= 0) && (currentSiteNumber == -1)) {
						// Read the "Site Name" property for the current site
						tempSiteName = dw.getPreferenceString("Sites\\-Site" + counter, "Site Name", "");

						// If the current site is the one we are looking for...
						if (tempSiteName === siteName) {
							currentSiteNumber = counter;
						}

						// If we have found a site we'll decrease the number of sites to help us stop when
						// all sites were checked and eventually quit the while (before reaching the 500 sites)
						if (tempSiteName !== "") {
							noOfSites--;
						}

						counter++;
					}
				}
			}
			
			return currentSiteNumber;
		}
		
		/**
		 * Returns the preferences path for a given preference site no
		 *
		 * @param Number siteNo The preference site no
		 * @return String The preference path for the given site preference no, or empty string if not found
		 */
		function getPrefsPathForSiteNo( siteNo ) {
			var prefRegPath = "";

			if ( 0 <= siteNo ) {
				prefRegPath = "Sites\\-Site" + siteNo;
			}

			return prefRegPath;	
		};
		
		function getAppVersion() {
			var appVersionParts = dw.appVersion.split( "." );
			return appVersionParts.length ? parseInt( appVersionParts[0] ) : 10;
		};

		var siteNo = getSiteNumberForSite(DWSiteName);
		
		var urls = new Array();
		var prefsPath = getPrefsPathForSiteNo( siteNo );

		if ( 11 > getAppVersion() ) {
			urls.push( dw.getPreferenceString( prefsPath , "URL Prefix", "" ) );
			urls.push( dw.getPreferenceString( prefsPath , "Root URL", "" ) );
		} else {
			var siteServers = dw.getPreferenceInt( prefsPath, "SiteServers", 0 );
			for ( var i = 0; i < siteServers; i++ ) {
				urls.push( dw.getPreferenceString( prefsPath , "SiteServer " + i + "\\WebUrl" ) );
			}
		}

		return urls;
	},
	
	/**
	 * Inserts code into the current DW document
	 *
	 * @param String The code to be inserted
	 */	
	insertCode : function (code) {
		MM.BC.log('code --- ' + code);
		
		var canInsert = MM.BC.UTILS.selectionIsInEditableRegion();
		if (!canInsert) {
			dreamweaver.beep(); 
			return;
		}
		
		if (!MM.BC.isInsertingCode) {
			MM.BC.isInsertingCode = true;
			dw.runCommand('BusinessCatalyst_ModifyDOM.htm', 'insertCode', code);
		}		
	},
	
	/**
	 * Returns the HEX color code given the RGB values
	 *
	 * @param Number Red value
	 * @param Number Green value
	 * @param Number Blue value
	 * @return String The HEX color code
	 */
	RGB2HTML : function(red, green, blue) {
	    var decColor = red + 256 * green + 65536 * blue;
	    return decColor.toString(16);
	},
	
	/**
	 * returns the site root for an url
	 *
	 * @param String url value
	 */
	getSiteRootForURL : function(url) {
		var siteRoot = "";
		var siteName = "";
		
		if (!url) {
			siteName = site.getCurrentSite();
		} else {
			siteName = site.getSiteForURL(url);
		}
		
		siteRoot = site.getLocalRootURL(siteName);
		
		return siteRoot;
	},
	
	/**
	 * open an url in browser through a local redirect
	 *
	 * @param String url value
	 */
	browseDocument : function(url) {
		var tempfile = dw.getTempFolderPath() + "/redirect.html";
		var content = "<html><head><style type=\"text/css\">body{padding:0;margin:0;width:100%;height:100%;background:url(../Shared/BC/Images/ajaxload-xd.gif) no-repeat center center;}</style></head><body><script language='JavaScript'>self.location='" + url + "';</script></body></html>";
		DWfile.write(tempfile, content);
		dw.browseDocument(tempfile); 
	},
	
	/**
	 * update the related files from locked regions deptfiles
	 *
	 * @param Document DOM dom to update the related files in
	 */
	updateRelatedFiles : function (dom) {
		try {
			if (!dom.URL) return;
			
			var url = dom.localPathToSiteRelative( dom.URL );
			
			var relatedFiles = MM.BC.UTILS.getRelatedFilesFromCurrentDOM(dom);
			
			if (relatedFiles) {
				MM.BC.UTILS.updateRelatedFilesForDom( dom, MM.BC.UTILS.RelatedFiles[ url ], relatedFiles );
				MM.BC.UTILS.RelatedFiles[ url ] = new Array().concat( relatedFiles );
			}
			
		} catch (e) {
		
		}
	},	
		
	/**
	 * get a list of related files from a dom
	 *
	 * @param Document DOM dom to update the related files in
	 */
	getRelatedFilesFromCurrentDOM : function (dom) {
		dw.useTranslatedSource( true );
		
		if (!dom) return [];
		
		var elems = dom.documentElement.getElementsByTagName( "MM:BeginLock" );
		dw.useTranslatedSource( false );

		if ( !elems || !elems.length ) {
			return [];
	}	
	
		var relatedFilesHash = new Object();

		for ( var i = 0; i < elems.length; i++ ) {
			if ( elems[i].getAttribute( "translatorClass" ) != "BUSINESS_CATALYST_DYNAMIC" ) {
				continue;
			}

			var depFiles = elems[i].getAttribute( "depFiles" );
			var files = depFiles.split( /\s*,\s*/gi );
			for ( var fileIndex = 0; fileIndex < files.length; fileIndex++ ) {
				if (files[ fileIndex ]) {
				relatedFilesHash[ files[ fileIndex ] ] = true;
			}
		}
		}

		var relatedFiles = new Array();
		for ( var file in relatedFilesHash ) {
			relatedFiles.push( file );
		}

		return relatedFiles;
	},

	/**
	 *  update related files list in dw
	 *
	 * @param Document DOM dom to update the related files in
         * @param Array existing related files
         * @param Array new related files
	 */
	updateRelatedFilesForDom : function ( dom, existingFiles, newFiles ) {
		if ( existingFiles && existingFiles.length ) {
			for ( var i = 0; i < existingFiles.length; i++ ) {
				if ( 0 <= newFiles.indexOf( existingFiles[ i ] ) ) {
					// file still exists, do not remove it
					continue;
				}
				
				dom.removeRelatedFile( existingFiles[ i ] );
			}
		}

		if ( newFiles && newFiles.length ) {
			for ( var i = 0; i < newFiles.length; i++ ) {
				dom.addRelatedFile( newFiles[ i ] );
			}
		}

		dreamweaver.refreshRelatedFiles();
	},
	/**
	 * force translators to run by changing the dom inner html
	 *
	 */
	runTranslators : function() {
		dw.runCommand('BusinessCatalyst_ModifyDOM.htm', 'replaceWithUntranslatedSource');
	},

	findModuleEnd : function(str, startIndex) {
		var currentIndex = startIndex;
		
		var indexOfCurlyStart = str.indexOf('{', currentIndex + 1);
		var indexOfCurlyEnd = str.indexOf('}', currentIndex + 1);
		
		while (indexOfCurlyStart < indexOfCurlyEnd && indexOfCurlyStart != -1) {
			indexOfCurlyStart = str.indexOf('{', indexOfCurlyStart + 1);
			indexOfCurlyEnd = str.indexOf('}', indexOfCurlyEnd + 1);
		}
					
		return indexOfCurlyEnd;
	},

	isInTag : function(str, index) {
		var source = str.substring(0, index);

		var lastGt = source.lastIndexOf('>');
		var lastLt = source.lastIndexOf('<');
		

		if ( lastLt > lastGt) {
			return true;
		}
		return false;
	},

	findAllModules : function(str) {
		var modulesStartRegExp = /\{\s*module_\w+/i;
		var source = str;
		var search = source.search(modulesStartRegExp);
		var founds = [];
		
		var offset = 0;
		
		
		while (search != -1) {

			var end = MM.BC.UTILS.findModuleEnd(source, search);

		
			if (end != -1) {
		
				if (!MM.BC.UTILS.isInTag(str, search + offset)) {
					var index = {start : search + offset, end : end + offset};
					index.token = str.substring(index.start, index.end + 1);
					founds.push(index);
				}
			
			}
			
			var oldLength = source.length;
			
			if (end != -1) {
				source = source.substr(end + 1);
			} else {
				source = source.substr(search + 1);
			}
			
			offset = offset + (oldLength - source.length);

			search = source.search(modulesStartRegExp);
		}
		
		
		return founds;
	},
	
	/**
	 * Checks  the page is based on a template
	 *
	 */
	isTemplatePage : function (dom) {
		return (dom.getAttachedTemplate() != "");
	},
	
	/**
	 * Checks if selection is in an editable region
	 *
	 */
	selectionIsInEditableRegion : function () {
		var isInside = false;
		var dom = dw.getActiveWindow();
		var instanceBegin = /<!--\s*InstanceBeginEditable[^>]*-->/i;
		
		// if is a file based on a template//
		if (MM.BC.UTILS.isTemplatePage(dom)) {
			// get offsets//
			var offs = dom.source.getSelection();
			
			// get editable regions//
			var eRegions = dom.getEditableRegionList();

			// get document outer html//
			var outerHTML = dom.documentElement.outerHTML;
			
			for (var i = 0; i < eRegions.length; i++) {
				try {
					// get index of editable region in page//
					var start = outerHTML.indexOf(eRegions[i].outerHTML);
					
					// match editable region comment//
					var commentMatch = eRegions[i].outerHTML.match(instanceBegin);
					
					// add it to start index//
					start += commentMatch[0].length;
					
					// end index of editable region//
					var end = start + eRegions[i].innerHTML.length;
					
					if (offs[0] >= start && offs[1] <= end) {
						isInside = true;
						break;
					}
				} catch (e) {
				
				}
			}
		} else {
			isInside = true;
		}
		
		return isInside;
	}
}
