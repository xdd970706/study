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

 // BC DW log file
MM.BUSINESS_CATALYST_LOG_FILE = "log.txt";

// TODO: this should be read from the server and cached locally
MM.BUSINESS_CATALYST_LIQUID_LOOP_TRANSLATE_COUNT = 3;

MM.BUSINESS_CATALYST_REGEXP = {
	"module": /\{\s*((module_\w+)(?:[\s,]*?\w*\s*=\s*"[^"]*")*)\s*\}/i,
	
	"include": /(\{\s*\%\s*include\s*")([^"]*)("[\w\W]*?\%\s*\})/i,
	"include_b": /^(\{\s*\%\s*include\s*")([^"]*)("[\w\W]*?\%\s*\})/i,
	"include_global": /(\{\s*\%\s*include\s*")([^"]*)("[\w\W]*?\%\s*\})/gi
};

if ( !MM.BC ) MM.BC = {

	PANEL_EXISTS : false,
	
	activeURL : "",
	activeSite : "",

	resetActiveFileAndSite : function() {
		MM.BC.activeURL = "";
		MM.BC.activeSite = -1;
	},
	
	/**
	 * Returns user configuration path
	 */	
	getConfigurationPath : function() {
		return dw.getTempFolderPath().replace(/\/Temp\/?$/, '');
	},
	
	/**
	 * Handles the operations that need to be done on each selection change (checks if the page changed and updates the bindings)
	 */	
	selectionChanged : function() {
		var siteID = MM.BC.SITE.getSiteID();
		if (!siteID || !MM.BC.SITE.siteIsInSitesList(siteID)) {
			MM.BC.activeURL = -1;
			return;
		}

		if (!MM.BC.CACHE.haveCachedDataForSite(siteID)) {
			MM.BC.activeURL = -1;
			return;
		}

		// check if same file//
		var dom = dw.getDocumentDOM();
		if (!dom || dom.URL == MM.BC.activeURL) {
			return;
		}

		MM.BC.activeURL = dom.URL;
		
		MM.BC.BINDINGS.updateBindings();
	},
	
	/**
	 * Handles the operations that need to be done on site change (reset the modules code hinting)
	 */	
	siteChanged : function() {
		
		
		
		MM.BC.HINTS.resetBrowseHintsMenu();
		MM.BC.HINTS.createBrowseHintsMenu();
		
		
		MM.BC.HINTS.resetModulesHintsMenu();
		MM.BC.HINTS.createModulesHintsMenu();
		
	},
	
	/**
	 * Handles the operations that need to be done on each document edit (looks for loops and assigns to update the bindings)
	 */		
	documentEdited : function() {
		var siteID = MM.BC.SITE.getSiteID();
		
		if (!siteID || !MM.BC.CACHE.haveCachedDataForSite(siteID)) {
			return;
		}
		
		try {
			// test if rules, loops and assigns have changed in page //
			var rulesChanged = MM.BC.BINDINGS.matchedRulesChanged();
			var loopsChanged = MM.BC.BINDINGS.matchedLoopsChanged();
			var assignsChanged = MM.BC.BINDINGS.matchedAssignsChanged();
			
			if (!rulesChanged && !loopsChanged && !assignsChanged) return;
		} catch (e) {
			MM.BC.log(e);
		}
		
		// as rules, loops or assigns matched on page changed, recreate bc hints menu//
		MM.BC.BINDINGS.updateBindings();
	},

	/**
	 * Check if the user is logged in
	 *
	 * @return Boolean True if the user is logged in
	 */
	isLoggedIn : function() {
		return dw.getPreferenceString(MM.BC.CONSTANTS.PREFERENCE_SECTION_BC, MM.BC.CONSTANTS.PREFERENCE_KEY_BC_LOGIN_TOKEN, "") != "";
	},
	
	/**
	 * Launches the BC login dialog
	 */	
	launchLogin : function() {
		dw.setPreferenceString(MM.BC.CONSTANTS.PREFERENCE_SECTION_BC, MM.BC.CONSTANTS.PREFERENCE_KEY_BC_DIALOG_STATE, "login"); 
		dw.loadCSXSExtension("com.adobe.dwimsconnection");
	}
};

/**
 * Logs the message in the site reports panel
 */
MM.BC.log = function (message) {
	if (MM.BC.showLogs) {
   		dw.resultsPalette.siteReports.addResultItem(this, 'BC', 5, 'BC', unescape(message), 0, 0, 0, 0, true);
   	}
}

/**
 * Called when DW launches
 */
function bcinit() {
	if (MM.BC && MM.BC.CACHE && MM.BC.CACHE.LAST_USER_SITES_LIST) {
		MM.BC.CACHE.LAST_USER_SITES_LIST = null;
	}
	
	if (MM.BC && MM.BC.CACHE && MM.BC.CACHE.CACHED_SITES_IDS) {
		MM.BC.CACHE.CACHED_SITES_IDS = null;
	}
	
	// load bc cache//
	MM.BC.CACHE.loadCache();
};
