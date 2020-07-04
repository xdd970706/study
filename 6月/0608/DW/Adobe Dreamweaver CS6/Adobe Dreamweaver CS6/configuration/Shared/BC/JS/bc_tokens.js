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

if (!MM.BC.TOKENS) MM.BC.TOKENS = {
	
	ONE_TIME_TOKENS : {},
	
	/**
	 * Clears the saved tokens for all sites
	 *
	 */
	clearAllTokens : function() {
		MM.BC.SITE_TOKENS = {};
		MM.BC.TOKENS.ONE_TIME_TOKENS = {};
	},
	
	/**
	 * Clears all saved tokens (site and one time) for a site
	 *
	 * @param String The ID of the site
	 */	
	clearAllTokensForSite : function(siteID) {
		if (MM.BC.SITE_TOKENS && MM.BC.SITE_TOKENS[siteID]) {
			delete MM.BC.SITE_TOKENS[siteID]; 
		}
		
		if (MM.BC.TOKENS.ONE_TIME_TOKENS && MM.BC.TOKENS.ONE_TIME_TOKENS[siteID]) {
			delete MM.BC.TOKENS.ONE_TIME_TOKENS[siteID]; 
		}
	},

	/**
	 * Caches one time tokens in the MM.BC object 
	 *
	 * @param String The id of the site
	 * @param String An array of one time tokens
	 */
	cacheOneTimeTokens : function(siteID, tokens) {
		if (!MM.BC.TOKENS.ONE_TIME_TOKENS) MM.BC.TOKENS.ONE_TIME_TOKENS = {};
		if (!MM.BC.TOKENS.ONE_TIME_TOKENS[siteID]) MM.BC.TOKENS.ONE_TIME_TOKENS[siteID] = [];
		MM.BC.TOKENS.ONE_TIME_TOKENS[siteID] = MM.BC.TOKENS.ONE_TIME_TOKENS[siteID].concat(tokens);
	},

	/**
	 * Saves the site token in the global MM.BC object
	 *
	 * @param String The id of the site
	 * @param String The site token
	 */
	setSiteToken : function(siteID, token) {
		if (!MM.BC.SITE_TOKENS) MM.BC.SITE_TOKENS = {};

		MM.BC.SITE_TOKENS[siteID] = token;
	},
	
	/**
	 * Gets a site token
	 *
	 * @param String The id of the site
	 * @return String The site token
	 */
	getSiteToken : function(siteID) {
		if (MM.BC && MM.BC.SITE_TOKENS && MM.BC.SITE_TOKENS[siteID]) {
			return MM.BC.SITE_TOKENS[siteID];
		}
		return 0;
	},

	/**
	 * Gets a one time token and calls a function afterwards
	 *
	 * @param String The id of the site
	 * @param Funciton The callback function
	 */
	getOneTimeToken : function(siteID, callback, failed, force, context) {
		try {
			var siteToken = MM.BC.TOKENS.getSiteToken(siteID);
			
			if (!force && MM.BC.TOKENS.ONE_TIME_TOKENS && MM.BC.TOKENS.ONE_TIME_TOKENS[siteID] && MM.BC.TOKENS.ONE_TIME_TOKENS[siteID].length) {
				callback(MM.BC.TOKENS.ONE_TIME_TOKENS[siteID].pop());
				MM.BC.API.getOneTimeTokens(siteID, siteToken, function(tokens) {
					MM.BC.TOKENS.cacheOneTimeTokens(siteID, tokens);
				}, function(error) {/* keep fail silent */}, false, context);
			} else {
				try {
					MM.BC.API.getOneTimeTokens(siteID, siteToken, function(tokens) {
						MM.BC.TOKENS.cacheOneTimeTokens(siteID, tokens);
						callback(MM.BC.TOKENS.ONE_TIME_TOKENS[siteID].pop());
					}, failed, false, context);
				} catch(e) {
					MM.BC.log('getOneTimeToken ## no cached one## error=' + e);
				}
			}
		} catch(e) {
			MM.BC.log('getOneTimeToken error=' + e);
		}
	},

	/**
	 * Gets the generic token from the DW preference strings
	 *
	 */
	getGenericToken : function() {
		return dw.getPreferenceString(MM.BC.CONSTANTS.PREFERENCE_SECTION_BC, MM.BC.CONSTANTS.PREFERENCE_KEY_BC_LOGIN_TOKEN, "");
	}
}