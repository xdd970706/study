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

if ( !MM.BC )	MM.BC = {};

if ( !MM.BC.CONSTANTS ) MM.BC.CONSTANTS = {

	TIMEOUT : 30000,
	
	SITE_LOGIN_PROPERTY : 'siteLogin',
	SECURE_URL_PROPERTY : 'secureUrl',
	TOOLBOX_URL_PROPERTY : 'toolboxPanelUrl',
	ADMIN_URL_PROPERTY : 'adminUrl',
	SYSTEM_URL_PROPERTY : 'systemUrl',
	SITE_URL_PROPERTY : 'self',
	ONETIME_TOKEN_URL_PROPERTY : 'oneTimeToken',
	MODULES_URL_PROPERTY : 'modules',
	PUBLIC_TYPES_URL_PROPERTY : 'publicTypes',
	BINDINGS_RULES_URL_PROPERTY : 'bindingRules',
	LINKS_PROPERTY : 'links',
	SITE_LINKS_PROPERTY : 'siteLinks',
	
	/* String constant for preference string section of BC. */
	PREFERENCE_SECTION_BC :		'Business Catalyst',
	
	/* String constants for various BC preference keys. */
	PREFERENCE_KEY_BC_SERVER_URL :	'BC Server URL',
	PREFERENCE_KEY_BC_LOGIN_TOKEN :	'BC Login Token',
	PREFERENCE_KEY_BC_ONLY_LOGIN :	'BC Only Login',
	PREFERENCE_KEY_BC_STAY_LOGGED_IN :	'BC Stay Logged In',
	PREFERENCE_KEY_BC_SKIP_WELCOME :	'BC Skip Welcome',
	
	PREFERENCE_KEY_BC_DIALOG_STATE :	'BC Dialog State',
	
	DEFAULT_BC_SERVER_URL : 'https://api.worldsecuresystems.com',
	
	CURRENT_WORKSPACE: MM.BC.getConfigurationPath() + "/Workspace/current.txt",
	
	BC_LOCAL_PAGE: MM.BC.getConfigurationPath() + "/Floaters/BCLocalPage.html",
	BC_LOCAL_WELCOME_PAGE : MM.BC.getConfigurationPath() + "/Floaters/bcmod_static_welcomePage.html",
	
	MODULE_PI_NAME_MAX_WIDTH : 152
};

MM.BC.showLogs = false;

if ( !MM.BC.ERRORS ) MM.BC.ERRORS = {
	 /* No error. */
	NO_ERROR : 0,
	
	/* Stale generic token. */
	SESSION_TIMEOUT : 1,
	
	/* Unknown error while parsing the response. */
	PARSING_ERROR : 2,
	
	 /* Unknown XHR request failure. */
	XHR_FAILURE : 3,

	/* Site ID is invalid or null. */
	INVALID_SITEID : 4,
	
	/* Stale generic token. */
	TOKEN_ERROR : 5,
	
	/* Site has expired */
	TRIAL_SITE_EXPIRED : 6,
	
	/* mm browser has showed load failed page */
	MM_BROWSER_LOAD_FAILED : 7,
	
	DW_PAGE_LOAD_ERROR : 8,
	
	/* generic internet connection fail*/
	INTERNET_CONNECTION_FAILED : 9
};
