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

if (!MM.BC.SERVER) MM.BC.SERVER = {
    getDefaultDomain : function() {
		var preferedDomain = dw.getPreferenceString(MM.BC.CONSTANTS.PREFERENCE_SECTION_BC, MM.BC.CONSTANTS.PREFERENCE_KEY_BC_SERVER_URL, MM.BC.CONSTANTS.DEFAULT_BC_SERVER_URL);
		if (!preferedDomain) {
			preferedDomain = MM.BC.CONSTANTS.DEFAULT_BC_SERVER_URL;
		}
		return preferedDomain;
	},
	
	getSiteSecureUrl : function(siteID) {
		return MM.BC.SITE.getBCSiteLinkByName(siteID, MM.BC.CONSTANTS.SECURE_URL_PROPERTY, MM.BC.CONSTANTS.SITE_LINKS_PROPERTY);
	},

	getAdminUrl : function(siteID) {
		return MM.BC.SITE.getBCSiteLinkByName(siteID, MM.BC.CONSTANTS.ADMIN_URL_PROPERTY, MM.BC.CONSTANTS.SITE_LINKS_PROPERTY);
	},
	
	getToolboxUrl : function(siteID) {
		return MM.BC.SITE.getBCSiteLinkByName(siteID, MM.BC.CONSTANTS.TOOLBOX_URL_PROPERTY, MM.BC.CONSTANTS.SITE_LINKS_PROPERTY);
	},

    getSiteTokenUrl : function(siteID) {
		return MM.BC.SITE.getBCSiteLinkByName(siteID, MM.BC.CONSTANTS.SITE_LOGIN_PROPERTY, MM.BC.CONSTANTS.LINKS_PROPERTY);
	},
	
	getSiteDetailUrl : function(siteID) {
		return MM.BC.SITE.getBCSiteLinkByName(siteID, MM.BC.CONSTANTS.SITE_URL_PROPERTY, MM.BC.CONSTANTS.LINKS_PROPERTY);
	},
	
	getOneTimeTokenUrl : function(siteID) {
		return MM.BC.SITE.getBCSiteLinkByName(siteID, MM.BC.CONSTANTS.ONETIME_TOKEN_URL_PROPERTY, MM.BC.CONSTANTS.LINKS_PROPERTY);
	},
	
	getModulesUrl : function(siteID) {
		return MM.BC.SITE.getBCSiteLinkByName(siteID, MM.BC.CONSTANTS.MODULES_URL_PROPERTY, MM.BC.CONSTANTS.LINKS_PROPERTY);
	},
	
	getBindingsRulesUrl : function(siteID) {
		return  MM.BC.SITE.getBCSiteLinkByName(siteID, MM.BC.CONSTANTS.BINDINGS_RULES_URL_PROPERTY, MM.BC.CONSTANTS.LINKS_PROPERTY);
	},
	
	getTypesUrl : function(siteID) {
		return MM.BC.SITE.getBCSiteLinkByName(siteID, MM.BC.CONSTANTS.PUBLIC_TYPES_URL_PROPERTY, MM.BC.CONSTANTS.LINKS_PROPERTY);
	},

	getSiteUrl : function (siteID) {
		return MM.BC.SERVER.getSiteSecureUrl(siteID);
	},
	
	getSitesApiUrl : function () {
		var defaultDomain = MM.BC.SERVER.getDefaultDomain();
		return defaultDomain + '/api/v1/admin/sites'
	},
	
    getGenericTokenUrl : function() {
		var defaultDomain = MM.BC.SERVER.getDefaultDomain();
		return defaultDomain + '/api/v1/admin/tokens';
	}
}

if (!MM.BC.API) MM.BC.API = {
	/* String constant for get request. */
	GET_REQUEST : 'GET',

	/* String constant for post request. */
	POST_REQUEST : 'POST',
	
	/* String constant for post request. */
	DELETE_REQUEST : 'DELETE',
	
	/* Constant to indicate XHR request is completed. */
	XHR_REQUEST_COMPLETE : 4,

	/* Constant to indicate XHR status is ok. */
	XHR_STATUS_OK : 200,
	
	/* Constant for BC error code corresponding to unauthorized request. */ 
	XHR_UNAUTHORIZED : 401,
	
	/* Constant for BC error code corresponding to bad request. */ 
	XHR_BAD_REQUEST : 400,
	
	/* Constant for BC sub-erorr code corresponding to invalid site id. */
	XHR_INVALID_SITE_ID : 103003,

	/* Constant for BC error code corresponding to a uncompleted request. (dw returns its error page as a result) */
	XHR_DW_PAGE_ERROR : 12007,
	
	/* String constant for content type header name. */
	CONTENT_TYPE_HEADER : 'Content-type',

	/* String constant for content type header value of json. */
	CONTENT_TYPE_HEADER_VALUE_JSON : 'application/json',

	/* String constant for content type header name. */
	ACCEPT_LANGUAGE_HEADER : 'Accept-Language',

	/* String constant for content type header value of json. */
	ACCEPT_LANGUAGE_HEADER_VALUE : dw.getAppLanguage(),

	/* String constant for accept-encoding header */
	ACCEPT_ENCODING_HEADER : 'Accept-Encoding',

	/* String constant for gzip request */
	ACCEPT_ENCODING_VALUE : 'gzip, deflate',

	/* String constant for authorization request. */
	AUTHORIZATION_HEADER : 'Authorization',
	
	/* list of xhrs that needs to be aborted in case of timeout fail */
	XHRS : {},

	LAST_USED_ID : 0,
	
	/**
	 * Makes an XHR call to the server and makes a callback on success or failure
	 *
	 * @param String The URL for the call
	 * @param String The method used for the call
	 * @param Object The headers object 
	 * @param Function Success callback
	 * @param Function Failure callback
	 */	
	getServerData : function (url, method, headers, success, failed, context) {

		MM.BC.UI_UTILS.getBCXMLHttpRequest(function(xhr) {
			if (!xhr) {
				MM.BC.reportError(MM.BC.ERRORS.XHR_FAILURE);
				return;
			}
			
			var timeoutID;
			
			function getErrorStatus(xhr) {
				if (!xhr) return "";
				
				var errorStatus = "";	
				var contentTypeHeaderValue = xhr.getResponseHeader(MM.BC.API.CONTENT_TYPE_HEADER);
				
				//  If the content-type of response is JSON, parse response to get the error code; else use only the status.
				if (contentTypeHeaderValue && contentTypeHeaderValue.indexOf(MM.BC.API.CONTENT_TYPE_HEADER_VALUE_JSON) != -1) {
					var errorCodeObject = MM.BC.JSON.parse(xhr.responseText);
					var errorCode = (errorCodeObject) ? errorCodeObject.code : "";
					errorStatus = xhr.status + ":" + errorCode;
				} else {
					errorStatus = xhr.status;
				}
				
				return errorStatus;
			}

			function getErrorCode(xhr) {
				if (!xhr) return "";
				
				var errorCode = "";
				var contentTypeHeaderValue = xhr.getResponseHeader(MM.BC.API.CONTENT_TYPE_HEADER);
				
				//  If the content-type of response is JSON, parse response to get the error code; else return null.//
				if (contentTypeHeaderValue && contentTypeHeaderValue.indexOf(MM.BC.API.CONTENT_TYPE_HEADER_VALUE_JSON) != -1) {
					var errorCodeObject = MM.BC.JSON.parse(xhr.responseText);
					if (errorCodeObject) {
						errorCode =  errorCodeObject.code;
					}
				}
				
				return errorCode;
			}

			function getBCErrorCode(status, xhr) {
			
				switch( status ) {
					case MM.BC.API.XHR_UNAUTHORIZED : 
						return  MM.BC.ERRORS.SESSION_TIMEOUT
						
					case MM.BC.API.XHR_DW_PAGE_ERROR :
						return MM.BC.ERRORS.DW_PAGE_LOAD_ERROR
						
					case MM.BC.API.XHR_BAD_REQUEST : 
						var errorCode = getErrorCode(xhr);
						if (errorCode == MM.BC.API.XHR_INVALID_SITE_ID) {
							return  MM.BC.ERRORS.INVALID_SITEID
						}
				}
				
				var errorCode = getErrorCode(xhr);
				return errorCode ? errorCode : MM.BC.ERRORS.INTERNET_CONNECTION_FAILED;
			}
			
			try {
				xhr.open(method, url, true);

				xhr.setRequestHeader(MM.BC.API.ACCEPT_LANGUAGE_HEADER, MM.BC.API.ACCEPT_LANGUAGE_HEADER_VALUE);
				xhr.setRequestHeader(MM.BC.API.CONTENT_TYPE_HEADER, MM.BC.API.CONTENT_TYPE_HEADER_VALUE_JSON);
				xhr.setRequestHeader(MM.BC.API.ACCEPT_ENCODING_HEADER, MM.BC.API.ACCEPT_ENCODING_VALUE);
				
				if (headers) {
					// add headers to request//
					for (var header in headers) {
						xhr.setRequestHeader(header, headers[header]);
					}
				}
				
				MM.BC.API.LAST_USED_ID++;
				
				// add the xhr to the list of xhrs that need to be aborted in case of timeout fail//
				MM.BC.API.XHRS[MM.BC.API.LAST_USED_ID + ""] = {xhr : xhr, failed : failed, url : url};
				
				// fail if we have no respone in 5 sec//
				MM.BC.API.apiTimeout = function (index) {
					if (MM.BC.API.XHRS[index + ""]) {
						var xhr_url = MM.BC.API.XHRS[index + ""].url;
						var xhr_failed = MM.BC.API.XHRS[index + ""].failed;
						var xhr = MM.BC.API.XHRS[index + ""].xhr;
						
						MM.BC.API.XHRS[index + ""] = null;
						
						for (var item in MM.BC.API.XHRS) {
							if (MM.BC.API.XHRS[item] && MM.BC.API.XHRS[item].xhr) {
								try {
									MM.BC.API.XHRS[item].xhr.abort();
								} catch (e) {
								}
							}
						}
						
						try {
						xhr.abort();
						} catch (e) {
						}
						
						if (xhr_failed) xhr_failed(MM.BC.ERRORS.XHR_FAILURE);
					}
				}
				
				xhr.onreadystatechange = function() {
					// if request complete//
					if (xhr.readyState == MM.BC.API.XHR_REQUEST_COMPLETE) {		
						clearTimeout(timeoutID);
						
						// if request status is success //
						if (xhr.status == MM.BC.API.XHR_STATUS_OK) {
							success(xhr.responseText, xhr);
						} else {
							if (xhr.status != 0) {
								MM.BC.log('MM.BC.API.getServerData##xhr.status##' + xhr.status + "##" + url, true);
							if (failed) failed(getBCErrorCode(xhr.status, xhr), xhr);
						}
					}
					}
				};
				
				try {
				xhr.send();
					// add a general timeout, as some calls take ~1min until timeout (with no internet connection)
					timeoutID = setTimeout("MM.BC.API.apiTimeout(" + MM.BC.API.LAST_USED_ID + ")", MM.BC.CONSTANTS.TIMEOUT);
				} catch (e) {
					if (failed) failed(MM.BC.ERRORS.XHR_FAILURE, xhr);
				}
			} catch (e) {
				if (failed) failed(MM.BC.ERRORS.XHR_FAILURE, xhr);
			}
		}, context);
	},
	
	/**
	 * Cancels all api calls
	 *
	 */	
	cancelApis : function() {
		if (MM.BC.API.XHRS) {
			for (var item in MM.BC.API.XHRS) {
				if (MM.BC.API.XHRS[item] && MM.BC.API.XHRS[item].xhr) {
					try {
						MM.BC.API.XHRS[item].xhr.abort();
					} catch (e) {
					}
				}
			}
		}
	},
	
	/**
	 * Get the site list
	 *
	 * @param String The generic authentication token
	 * @param Function Success callback
	 * @param Function Failure callback
	 */	
	getSitesList : function(genericToken, success, failed) {
		var sitesListUrl = MM.BC.SERVER.getSitesApiUrl();
		
		var authHeader = {};
		authHeader[MM.BC.API.AUTHORIZATION_HEADER] = genericToken;
		
		function getSitesListCallback(data) {
			var sitesList = MM.BC.JSON.parse(data);
			if (sitesList) {
				if (success) success(sitesList);
			} else {
				if (failed) {
					failed(MM.BC.ERRORS.PARSING_ERROR);
				} else {
					MM.BC.reportError(MM.BC.ERRORS.PARSING_ERROR);
				}
			}
		}
		
		function apiCallFailed(status, xhr) {
			if (failed) {
				failed(status);
			} else {
			MM.BC.reportError(status);
			}
		}

		var separator = (sitesListUrl.indexOf('?') != -1) ? "&" : "?";
		var apiURL = sitesListUrl + separator + "status=" + 0x7F;
		MM.BC.API.getServerData(apiURL, MM.BC.API.GET_REQUEST, authHeader, getSitesListCallback, apiCallFailed);
	},
	
	
	/**
	 * Deletes a generic token on the server
	 *
	 * @param String The generic authentication token
	 * @param Function Success callback
	 * @param Function Failure callback
	 */	
	deleteGenericToken : function(genericToken, success, failed) {
		var tokensURL = MM.BC.SERVER.getGenericTokenUrl();
		
		MM.BC.forceDocumentBrowserLoad = true;
		
		MM.BC.log('delete generic token called --- ' + genericToken);
		
		var authHeader = {};
		authHeader[MM.BC.API.AUTHORIZATION_HEADER] = genericToken;
		
		function deleteSiteTokenCallback(data) {
			MM.BC.log('deleted generic token --- ' + genericToken);
			if (success) success();
		}
		
		function apiCallFailed(status, xhr) {
			MM.BC.log('failed deleting token --- ' + genericToken + ' --- ' + status);
			if (failed) failed();
		}
		
		MM.BC.log('calling delete API --- ' + tokensURL + ' --- ' + MM.BC.API.DELETE_REQUEST);
		MM.BC.API.getServerData(tokensURL, MM.BC.API.DELETE_REQUEST, authHeader, deleteSiteTokenCallback, apiCallFailed);
	},	
	
	/**
	 * Get site details
	 *
	 * @param String The site ID
	 * @param String The generic authentication token
	 * @param Function Success callback
	 * @param Function Failure callback
	 */
	getSiteDetail : function(siteID, genericToken, success, failed) {
		
		var siteTokenUrl = MM.BC.SERVER.getSiteDetailUrl(siteID);
		
		var authHeader = {};
		authHeader[MM.BC.API.AUTHORIZATION_HEADER] = genericToken;
		
		function getDetailsCallback(data) {
			var siteDetailsObject = MM.BC.JSON.parse(data);
			if (siteDetailsObject) {
				if (success) success(siteDetailsObject);
			} else {
				if (failed) {
					failed(MM.BC.ERRORS.PARSING_ERROR);
				} else {
					MM.BC.reportError(MM.BC.ERRORS.PARSING_ERROR);
				}
			}
		}
		
		function apiCallFailed(status, xhr) {
			if (failed) {
				failed(MM.BC.ERRORS.XHR_FAILURE, xhr);
			} else {
			MM.BC.reportError(status);
			}
		}
		
		MM.BC.API.getServerData(siteTokenUrl, MM.BC.API.GET_REQUEST, authHeader, getDetailsCallback, apiCallFailed);
	},
	
	/**
	 * Get a one time token
	 *
	 * @param String The site ID
	 * @param String The site authentication token
	 * @param Function Success callback
	 * @param Function Failure callback
	 * @param Boolen If false, on failure it will try to get a new site token and retry
	 */
	getOneTimeTokens : function(siteID, siteToken, success, failed, skipSiteTokenRenewal, context) {
		var oneTimeTokenUrl = MM.BC.SERVER.getOneTimeTokenUrl(siteID);
		
		var authHeader = {};
		authHeader[MM.BC.API.AUTHORIZATION_HEADER] = siteToken;
		
		function getTokenCallback(data) {
			var oneTimeTokenObject = MM.BC.JSON.parse(data);
			if (oneTimeTokenObject && oneTimeTokenObject.token) {
				if (success) success(oneTimeTokenObject.token);
			} else {
				if (failed) {
					failed(MM.BC.ERRORS.PARSING_ERROR);
				} else {
				MM.BC.reportError(MM.BC.ERRORS.PARSING_ERROR);
			}
		}
		}
		
		function apiCallFailed(status, xhr) {
		
			// if authorization error, try again with a new site token//
			if (status== MM.BC.ERRORS.SESSION_TIMEOUT && !skipSiteTokenRenewal) {
				// try to get a new site token, and retry getting a one time token//
				MM.BC.API.getSiteToken(siteID, MM.BC.TOKENS.getGenericToken(), function(newToken) {
					MM.BC.TOKENS.setSiteToken(siteID, newToken);
					// retry to get one time token, and make sure we don't get into a loop by setting skipSiteTokenRenewal to true//
					MM.BC.API.getOneTimeTokens(siteID, newToken, success, failed, true, context)
				}, function(status, xhr) {
					if (failed) { 
						failed(MM.BC.ERRORS.XHR_FAILURE, xhr);
					} else {
					MM.BC.reportError(status);
					}
				}, context)
				
				return;
			}
			
			if (failed) {
				failed(MM.BC.ERRORS.XHR_FAILURE, xhr);
			} else {
			MM.BC.reportError(status);
			}
		}
		
		MM.BC.API.getServerData(oneTimeTokenUrl, MM.BC.API.POST_REQUEST, authHeader, getTokenCallback, apiCallFailed, context);
	},
	
	/**
	 * Get site token 
	 *
	 * @param String The site ID
	 * @param String The generic authentication token
	 * @param Function Success callback
	 * @param Function Failure callback
	 */
	getSiteToken : function(siteID, genericToken, success, failed, context) {
		
		var siteTokenUrl = MM.BC.SERVER.getSiteTokenUrl(siteID);
		
		var authHeader = {};
		authHeader[MM.BC.API.AUTHORIZATION_HEADER] = genericToken;
		
		function getTokenCallback(data) {
			var siteTokenObject = MM.BC.JSON.parse(data);
			if (siteTokenObject && siteTokenObject.token) {
				if (success) success(siteTokenObject.token);
			} else {
				if (failed) {
					failed(MM.BC.ERRORS.PARSING_ERROR);
				} else {
					MM.BC.reportError(MM.BC.ERRORS.PARSING_ERROR);
				}
			}
		}
		
		function apiCallFailed(status, xhr) {
			if (failed) {
				failed(MM.BC.ERRORS.XHR_FAILURE, xhr);
			} else {
			MM.BC.reportError(status);
			}
		}
		
		MM.BC.API.getServerData(siteTokenUrl, MM.BC.API.POST_REQUEST, authHeader, getTokenCallback, apiCallFailed, context);
	},
	
	/**
	 * Get modules, types and bindings data for the current site
	 *
	 * @param String The site ID
	 * @param String The site authentication token
	 * @param Function Success callback
	 * @param Function Failure callback
	 */
	getSiteData : function(siteID, siteToken, success, failed) {
		MM.BC.CACHE.clearDataForSite(siteID);
		
		var bindingsUrl = MM.BC.SERVER.getBindingsRulesUrl(siteID);
		var modulesUrl = MM.BC.SERVER.getModulesUrl(siteID);
		var typesUrl = MM.BC.SERVER.getTypesUrl(siteID);
		
		var authHeader = {};
		authHeader[MM.BC.API.AUTHORIZATION_HEADER] = siteToken;
		
		function apiCallFailed(status, xhr) {
			if (failed)  {
				failed(MM.BC.ERRORS.XHR_FAILURE, xhr);
			} else {
			MM.BC.reportError(status);
			}
		}
		
		function checkIfComplete() {
			if (MM.BC.CACHE.haveCachedDataForSite(siteID)) {
				if (success) success();
			}
		}
		
		MM.BC.API.getServerData(bindingsUrl, MM.BC.API.GET_REQUEST, authHeader, function(data) {
			MM.BC.CACHE.cacheBCBindings(siteID, data);
			checkIfComplete()
		}, apiCallFailed);
		
		MM.BC.API.getServerData(typesUrl, MM.BC.API.GET_REQUEST, authHeader, function(data) {
			MM.BC.CACHE.cacheBCTypes(siteID, data);
			checkIfComplete()
		}, apiCallFailed);
		
		MM.BC.API.getServerData(modulesUrl, MM.BC.API.GET_REQUEST, authHeader, function(data) {
			MM.BC.CACHE.cacheBCModules(siteID, data);
			checkIfComplete()
		}, apiCallFailed);
	}
}