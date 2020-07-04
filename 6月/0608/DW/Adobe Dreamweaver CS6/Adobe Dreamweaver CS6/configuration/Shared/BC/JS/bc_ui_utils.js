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

if (!MM.BC.UI_UTILS) MM.BC.UI_UTILS = {
	
	/**
	 * Detects a MMBrowser in the page to use for XHR calls (if necessary creates one)
	 *
	 * @param Function Function to call after getting the XHR object
	 */
	getDocumentBrowser : function(callback, context) {
	
		var doc = (context && context.document) ? context.document : document;
		
		// if we find a browser with id "bc_priority_browser", use it //
		var dwBrowser = doc.getElementById('bc_internal_browser');
		
		var priorityBrowser = doc.getElementById('bc_priority_browser');
		if (priorityBrowser) {
			dwBrowser = priorityBrowser;
			dwBrowser.setAutomaticallyPromptForCredentials(false);
			callback(dwBrowser);
			return;
		}
		
		if (!dwBrowser || MM.BC.forceDocumentBrowserLoad) {
			
			MM.BC.forceDocumentBrowserLoad = false;
			
			if (doc.body.innerHTML.indexOf('bc_internal_browser') == -1) {
				doc.body.innerHTML = "<mm:browsercontrol id='bc_internal_browser' />" + doc.body.innerHTML;
			}
			
			dwBrowser = doc.body.firstChild;
			
			dwBrowser.setAutomaticallyPromptForCredentials(false);
			
			dwBrowser.addEventListener("BrowserControlLoad", function(e) {
				dwBrowser.style.display = "none";
				callback(dwBrowser);
			}, false);
			
			var localPage = MM.BC.getConfigurationPath() + '/Floaters/BCLocalPage.html';
			dwBrowser.openURL(localPage);
		} else {
			dwBrowser.style.display = "none";
			callback(dwBrowser);
		}
	},
	
	/**
	 * Gets an XHR object from the MMBrowser (if necessary creates a new MMBrowser)
	 *
	 * @param Function Function to call after getting the XHR object
	 */	
	getBCXMLHttpRequest : function (callback, context) {
		MM.BC.UI_UTILS.getDocumentBrowser(function(browser) {
			if (browser) {
				win = browser.getWindowObj();
				
				if (typeof(win) !='undefined') {
					if (!win.BC_INTERNAL_XMLHttpRequest) {
						MM.BC.UTILS.injectScript('BC_INTERNAL_XMLHttpRequest', "function BC_INTERNAL_XMLHttpRequest() {var xhr = new XMLHttpRequest(); return xhr; }", win);
					}
					callback(win.BC_INTERNAL_XMLHttpRequest());
					return;
				}
			}
			callback(null)
		}, context);
	},
	
	
	/**
	 * Opens a command that loads a web page 
	 *
	 * @param String The generic authentication token
	 * @param String The site ID for the current site
	 */	
	openPopupWindow : function(page, props) {
		var width, height;
		if (MM.BC.popupIsOpen) {
			return;
		}
		
		if (props) {
			var winProps = new Object();
			var propsArr = props.split(',');
			var prop;
	
			for (var i=0;i<propsArr.length;i++) {
				prop = propsArr[i].split('=');
				winProps[prop[0]] = prop[1];
			}
			
			width = winProps['width'];
			height = winProps['height'];
		}
		
		if (page.indexOf('/') == 0) {
			page = MM.BC.SERVER.getSiteSecureUrl(MM.BC.SITE.getSiteID(dw.getActiveWindow())) + page;
		}
		
		MM.BC.popupIsOpen = true;
		dw.runCommand('bc_configure_edit.htm', page, width, height);
		MM.BC.popupIsOpen = false;
		
		if (MM.BC.codeToInsert && MM.BC.codeToInsert != "") {
			MM.BC.UTILS.insertCode(MM.BC.codeToInsert);
			MM.BC.codeToInsert = "";
		}
	},
	
	/**
	 * Closes a command window (called from the page inside the MMBrowser)
	 *
	 */
	closeWindow : function() {
		window.close();
	},
	
	/**
	 * Open the DW native browse window
	 *
	 * @param String The ID of the control that called the browse process
	 */
	onBrowseFile : function(inputId) {
		var path = dw.browseForFileURL();
	},

	/**
	 * Returns the current document path, as an site-root absolute path
	 *
	 * @return String The current document path, or null if the file is not saved
	 */
	getCurrentDocumentPath : function() {
		var dom = dw.getActiveWindow();
		if (!dom || !dom.URL) {
			return null;
		}	
		
		return dom.localPathToSiteRelative(dom.URL);
	}
}
