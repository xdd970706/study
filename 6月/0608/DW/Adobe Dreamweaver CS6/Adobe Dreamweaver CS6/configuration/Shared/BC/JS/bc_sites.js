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

if (!MM.BC.SITE) MM.BC.SITE = {
	
	/**
	 * Gets a link from a BC site object
	 *
	 * @param Object The BC site object (at is comes from the site list API)
	 * @param String The rel property of the link
	 * @param String The name of the property holding the site links
	 * @return String The link (or null)
	 */			
	getBCSiteLink: function(site, rel, type) {
		if (site) {
		var links = site.siteLinks;
		if (type) {
			links = site[type];
		}
		
		if (!links) return null;
		for (var k =0; k < links.length;k++) {
			if (links[k].rel == rel) {
				return links[k].uri;
			}
		}
		}
		return null;
	},
	
	/**
	 * Looks for the site in the cache
	 *
	 * @param String The site ID
	 * @return Boolen The if site is found, false otherwise
	 */			
	siteIsInSitesList : function(siteID) {
		if (MM.BC_CACHE.SITES_LIST && MM.BC_CACHE.SITES_LIST[siteID]) {
			return true
		}
		return false;
	},
	
	/**
	 * Clears the cached list of site for the last logged in user
	 *
	 */			
	resetLastUserSiteList : function() {
		MM.BC.CACHE.LAST_USER_SITES_LIST = null;
	},
	
	/**
	 * Checks if we have a cached list of sites for the last logged in user
	 *
	 * @return Boolean True if the cache exists,false otherwise
	 */			
	haveLastUserSiteList : function() {
		return MM.BC.CACHE.LAST_USER_SITES_LIST;
	},

	/**
	 * Check is a site belongs to the current logged in user
	 *
	 * @param String The site ID
	 * @return String True if the site belongs to the user, false otherwise
	 */		
	isACurrentUserSite : function(siteID) {
		
		if (!MM.BC.CACHE.LAST_USER_SITES_LIST || MM.BC.CACHE.LAST_USER_SITES_LIST[siteID]) {
			return true;
		}
		return false;
	},

	/**
	 * Check if we made an extra site list call for a site id
	 *
	 * @param String The site ID
	 * @return String True  if we made an extra site list call for a site id
	 */
	doubleCheckedSiteList : function(siteID) {
		if (!MM.BC.CACHE.CHECKED_SITES_LIST) MM.BC.CACHE.CHECKED_SITES_LIST = {};
		
		if (!MM.BC.CACHE.CHECKED_SITES_LIST[siteID]) {
			return false;
		}
		
		return true;
	},
	
	/**
	 * Gets the site ID for the current document based on a DOM or a URL
	 *
	 * @param Object The DOM of the current page
	 * @param Object The URL of the current page (this is used when the DOM is not available - in the translator for example)	 
	 * @return String The site ID
	 */			
	getSiteID : function(dom, currentFileURL) {
		if (!dom) dom = dw.getDocumentDOM();
		if (!dom && !currentFileURL) return null;
		
		var url = currentFileURL ? currentFileURL : dom.URL;
		
		var unsaved = false;
		
		// if not a saved doc//
		if (url == "" || url == "file:///") {
			unsaved = true;
			url = MM.BC.UTILS.getSiteRootForURL();
		}
		
		if (url && MM.BC.CACHE.CACHED_SITES_IDS && MM.BC.CACHE.CACHED_SITES_IDS[url]) {
			return MM.BC.CACHE.CACHED_SITES_IDS[url];
		}
		
		var siteID;
		
		if (!unsaved && dom && dom.getBCSiteIDFromDoc && dom.getBCSiteIDFromDoc()) {
			siteID = dom.getBCSiteIDFromDoc();
		} else {
			siteID = MM.BC.SITE.getSiteIDByURL(url);
		}

		if (url) {
			if (!MM.BC.CACHE.CACHED_SITES_IDS) MM.BC.CACHE.CACHED_SITES_IDS = {};
			MM.BC.CACHE.CACHED_SITES_IDS[url] = siteID;
		}
		
		return siteID;
	},
	
	/**
	 * Gets a site object based on it's ID
	 *
	 * @param String The site ID
	 * @return Object The site object
	 */			
	getSiteObject : function(siteID) {
		if (MM.BC_CACHE.SITES_LIST && MM.BC_CACHE.SITES_LIST[siteID]) {
			return MM.BC_CACHE.SITES_LIST[siteID];
		}
		if (MM.BC_CACHE.SITES_LIST) {
			for (var i = 0 ; i < MM.BC_CACHE.SITES_LIST.length; i++) {
				if (MM.BC_CACHE.SITES_LIST[i] && MM.BC_CACHE.SITES_LIST[i].id == siteID) {
					return MM.BC_CACHE.SITES_LIST[i];
				}
			}
		}
	},
	
	/**
	 * Checks if a site is expired
	 *
	 * @param String The site ID
	 * @return Boolean True if site is expired, false otherwise
	 */		
	isSiteExpired : function(siteID) {
		var site = MM.BC.SITE.getSiteObject(siteID);
		
		if (site) {
		return (site.siteStatus == 2 || site.siteStatus == 8 || site.siteStatus == 16);
		} else {
		return false;
}
	},

	/**
	 * Gets a site's ID based on a page URL
	 *
	 * @param String The page URL
	 * @return String The site ID
	 */		
	getSiteIDByURL: function(pageURL) {
		var DWSiteName = site.getSiteForURL(pageURL);
		var urls = MM.BC.UTILS.getSiteUrls(DWSiteName);	
		var DWSiteURL = (urls && urls.length) ? urls[0] : "";
		
		if (MM.BC && MM.BC_CACHE.SITES_LIST) {
			var bcSite, bcSiteURL, dwCorrespondingSite;
			for (var i in MM.BC_CACHE.SITES_LIST) {
				bcSite = MM.BC_CACHE.SITES_LIST[i];
				if (bcSite) {
				bcSiteURL = MM.BC.SITE.getBCSiteLink(bcSite, MM.BC.CONSTANTS.SYSTEM_URL_PROPERTY);
				if (DWSiteURL.toLowerCase() == bcSiteURL.toLowerCase()) {
						return bcSite.id;
					}
				}
			}
			}
		
		return null;
	},
	
	/** 
	 * Gets a site link
	 *
	 * @param String The site ID
	 * @param String The name of the link
	 * @param String The link type
	 * @return String The site link
	 */			
	getBCSiteLinkByName : function(siteID, linkName, type) {
		var site = MM.BC.SITE.getSiteObject(siteID);
		if (site && site.siteLinks) {
			var bcSiteURL = MM.BC.SITE.getBCSiteLink(site, linkName, type);
			if (bcSiteURL) {
				return bcSiteURL.replace(/\/$/gi, '');
			} else {
				MM.BC.log('bcSiteURL##' + siteID + "@@" + linkName + "##" + type);
			}
		}
		return "";
	},
	
	/**
	 * Gets a site's name based on it's ID
	 *
	 * @param String The site ID
	 * @return String The site name
	 */		
	getSiteName : function(siteID) {
		var site = MM.BC.SITE.getSiteObject(siteID);
		if (site) {
			return site.name;
		}
		return "";
	}

}