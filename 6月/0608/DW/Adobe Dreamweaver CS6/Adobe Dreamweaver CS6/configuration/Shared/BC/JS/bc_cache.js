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

if ( !MM.BC_CACHE ) {
	MM.BC_CACHE = {};
}

if (!MM.BC.CACHE) MM.BC.CACHE = {
	
	CACHED_SITES_IDS: {},
	
	/**
	 * Save the cache to a local file in the Configuration folder
	 *
	 */		
	saveCache : function() {
		var cacheFile = MM.BC.UTILS.getBusinessCatalystDWFolder() + "bc_cache.bc";
		var cacheContent = MM.BC.JSON.stringify(MM.BC_CACHE)
		DWfile.write(cacheFile, cacheContent);
	},
	
	/**
	 * Loads the cache from the local cache file
	 *
	 */		
	loadCache : function() {
		var cacheFile = MM.BC.UTILS.getBusinessCatalystDWFolder() + "bc_cache.bc";
		var cacheContent = "{}"
		if (DWfile.exists(cacheFile)) {
			cacheContent = DWfile.read(cacheFile);
		}
		
		MM.BC_CACHE = eval('(' + cacheContent + ')');
	},
	
	/**
	 * Caches the available data types for a site ID
	 *
	 * @param String The ID of the site
	 * @param Object The data types object to be cached for the site
	 */	
	cacheBCTypes : function(siteID, data) {
		if (!MM.BC_CACHE) MM.BC_CACHE = {};
		if (!MM.BC_CACHE.TYPES) MM.BC_CACHE.TYPES = {};
		
		if (typeof(data).toLowerCase() == "string") {
			data = MM.BC.JSON.parse(data)
		}
		
		MM.BC_CACHE.TYPES[siteID] = data;
	},
	
	/**
	 * Caches the modules for a site ID
	 *
	 * @param String The ID of the site
	 * @param Object The modules object to be cached for the site
	 */	
	cacheBCModules : function(siteID, data) {
		if (!MM.BC_CACHE) MM.BC_CACHE = {};
		if (!MM.BC_CACHE.MODULES) MM.BC_CACHE.MODULES = {};
		
		if (typeof(data).toLowerCase() == "string") {
			data = MM.BC.JSON.parse(data)
		}
		
		MM.BC_CACHE.MODULES[siteID] = data;
	},

	/**
	 * Caches the available bindings for a site ID
	 *
	 * @param String The ID of the site
	 * @param Object The bindings object to be cached for the site
	 */	
	cacheBCBindings : function(siteID, data) {
		if (!MM.BC_CACHE) MM.BC_CACHE = {};
		if (!MM.BC_CACHE.BINDINGS) MM.BC_CACHE.BINDINGS = {};
		
		if (typeof(data).toLowerCase() == "string") {
			data = MM.BC.JSON.parse(data)
		}
		
		MM.BC_CACHE.BINDINGS[siteID] = data;
	},
	
	/**
	 * Gets the modules for a site ID
	 *
	 * @param String The ID of the site
	 * @return Object The cached modules for the site
	 */		
	getBCModules : function(siteID) {
		var modules = [];
		if (MM.BC_CACHE.MODULES && MM.BC_CACHE.MODULES[siteID]) {
			modules = MM.BC_CACHE.MODULES[siteID];
		}
		if (modules.items) {
			modules = modules.items;
		}
		
		return modules;
	},
	
	/**
	 * Gets the data types for a site ID
	 *
	 * @param String The ID of the site
	 * @return Object The cached data types for the site
	 */		
	getBCTypes : function(siteID) {
		var types = [];
		if (MM.BC_CACHE.TYPES && MM.BC_CACHE.TYPES[siteID]) {
			types = MM.BC_CACHE.TYPES[siteID];
		}
		
		if (types.items) {
			types = types.items;
		}
		
		return types;
	},
	
	/**
	 * Gets the bindings for a site ID
	 *
	 * @param String The ID of the site
	 * @return Object The cached bindings for the site
	 */		
	getBCBindings : function(siteID) {
		var bindings = [];
		if (MM.BC_CACHE.BINDINGS && MM.BC_CACHE.BINDINGS[siteID]) {
			bindings = MM.BC_CACHE.BINDINGS[siteID];
		}
		
		if (bindings.items) {
			bindings = bindings.items;
		}
		
		return bindings;
	},
	
	/**
	 * Clears the cached data for a site
	 *
	 * @param String The ID of the site
	 */		
	clearDataForSite : function(siteID) {
		if (MM.BC.CACHE.haveCachedDataForSite(siteID)) {
			if (MM.BC_CACHE.BINDINGS[siteID]) delete MM.BC_CACHE.BINDINGS[siteID];
			if (MM.BC_CACHE.MODULES[siteID]) delete MM.BC_CACHE.MODULES[siteID];
			if (MM.BC_CACHE.TYPES[siteID]) delete MM.BC_CACHE.TYPES[siteID];
		}
	},
	
	/**
	 * Saves a value in the cache for a site
	 *
	 * @param String The cache object ID
	 * @param String The site ID
	 * @param String The name of the cached property
	 * @param String the value of the cached property
	 */		
	cacheValueBySite : function(cacheID, siteID, name, value) {
		if (!MM.BC[cacheID]) MM.BC[cacheID] = {};
		if (!MM.BC[cacheID][siteID]) MM.BC[cacheID][siteID] = {};
		MM.BC[cacheID][siteID][name] = value;
	},
	
	/**
	 * Get a cache value for a site
	 *
	 * @param String The cache object ID
	 * @param String The site ID
	 * @param String The name of the cached property
	 * @param String ?!? - TBD if we still use this
	 * @return Object The cached property or null 
	 */		
	getCacheValueBySite : function(cacheID, siteID, name, value) {
		if (MM.BC[cacheID] && MM.BC[cacheID][siteID] && MM.BC[cacheID][siteID][name]) return MM.BC[cacheID][siteID][name];
		return null;
	},
	
	/**
	 * Checks if we have cached data for a site
	 *
	 * @return Boolean True if we have cached data, false otherwise
	 */	
	haveCachedDataForSite : function(siteID) {
		if (!MM.BC_CACHE) {
			return false;
		}
		
		if (!MM.BC_CACHE.BINDINGS || !MM.BC_CACHE.BINDINGS[siteID]) {
			return false;
		}
		
		if (!MM.BC_CACHE.TYPES || !MM.BC_CACHE.TYPES[siteID]) {
			return false;
		}
		
		if (!MM.BC_CACHE.MODULES || !MM.BC_CACHE.MODULES[siteID]) {
			return false;
		}
		
		return true;
	}
}