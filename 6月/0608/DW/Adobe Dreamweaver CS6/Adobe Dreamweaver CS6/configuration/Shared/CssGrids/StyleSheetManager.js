/*

 ADOBE CONFIDENTIAL
 ___________________

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

if (typeof CssGrids == 'undefined') CssGrids = {}; // Create our namespace

CssGrids.StyleSheetManager = function(inDw, inDom, inDwscripts, inDWfile, inStyleSheet) {		

	var self = this; 
	
	self.publicFunctions = [
		'beQuiet',
		'calcMarginOfError',
		'calcCssWidthFromColSpan',
		'calcCssMarginLeftFromColShift',
		'getGutterCssWidth',
		'getDeviceFromWindowWidth',
		'setColSpan',
		'setColShift',
		'toggleStartsNewRow',
		'insertRule',
		'loadGridProps',
		'getGridPropsRec',
		'getMaxNumColsAllDevices'
	];

	self.refs =	{		
		dw:	 			inDw,
		dom:			inDom,
		dwscripts: 		inDwscripts,
		DWfile: 		inDWfile,
		styleSheet: 	inStyleSheet,
		styleSheetRec: 	null,
		sheet: 			null,
		subSheet: 		null,
		rule:		 	null
	};
		
	self.data = {
		device: 		'',
		colWidth:		-1,
		gutterWidth:	-1,
		allColsWidth: { 	
			desktop:	-1,
			tablet: 	-1,
			mobile:		-1
		},	
		maxNumCols: { 
			desktop:	-1, 
			tablet:		-1, 
			mobile:		-1 
		}
	};
			
	self.consts = {
		devices: ['mobile', 'tablet', 'desktop'],
		msgs: {		
			couldNotFindStyleSheet:	inDw ? self.refs.dw.loadString('command/insertFluidGridLayoutDiv/CouldNotFindStyleSheet/errMsg') : '',
			couldNotCssText:		inDw ? self.refs.dw.loadString('command/insertFluidGridLayoutDiv/CouldNotCssText/errMsg') : '',
			couldNotFindMatchingMediaQueryStyleSheet: inDw ? self.refs.dw.loadString('command/insertFluidGridLayoutDiv/CouldNotFindMatchingSheet/errMsg') : ''
		}		
	};
					
	self.flags = {
		shouldBeQuiet: false
	};
		
	self.isFluidGridDoc = function() {
		return self.getStyleSheetRec() != null;
	}
	
	self.getMaxNumColsAllDevices = function() {
		var maxNumCols  = self.data.maxNumCols['desktop'];
		maxNumCols = Math.max(maxNumCols, self.data.maxNumCols['tablet']);
		maxNumCols = Math.max(maxNumCols, self.data.maxNumCols['mobile']);
		return maxNumCols;
	}
	
	self.getGridPropsRec = function(device) {
		return {
			allColsWidth:	self.data.allColsWidth[device],
			numCols:		self.data.maxNumCols[device],
			colWidth:		self.data.colWidth,
			gutterWidth:	self.data.gutterWidth
		};
	}
	
	self.loadGridProps = function() {
		if (!self.isFluidGridDoc()) {
			self.reportError(self.consts.msgs.couldNotFindStyleSheet);	
			return false;
		}
		var sheetTxt = self.getStyleSheetRec().cssText;
		self.data.maxNumCols =	{
			desktop:	self.getGridProp(sheetTxt, 'dw-num-cols-desktop:'), 
			tablet:		self.getGridProp(sheetTxt, 'dw-num-cols-tablet:'), 
			mobile: 	self.getGridProp(sheetTxt, 'dw-num-cols-mobile:') 
		};
		self.data.colWidth = 100;
		self.data.gutterWidth = self.getGridProp(sheetTxt, 'dw-gutter-percentage:');
		self.data.allColsWidth = {
			desktop:	self.data.maxNumCols['desktop'] * self.data.colWidth + (self.data.maxNumCols['desktop'] - 1) * self.data.gutterWidth,
			tablet: 	self.data.maxNumCols['tablet'] * self.data.colWidth + (self.data.maxNumCols['tablet'] - 1) * self.data.gutterWidth,
			mobile:		self.data.maxNumCols['mobile'] * self.data.colWidth + (self.data.maxNumCols['mobile'] - 1) * self.data.gutterWidth
		};
		return (
			self.data.maxNumCols['desktop'] != -1
			&&
			self.data.maxNumCols['tablet'] != -1
			&&
			self.data.maxNumCols['mobile'] != -1
			&&
			self.data.gutterWidth != -1
		);
	}
		
	self.getGridProp = function(sheetTxt, propNameAndColon) {
		var pos = sheetTxt.indexOf(propNameAndColon);
		if (pos == -1) {
			return -1;
		}
		pos += propNameAndColon.length;	
		var val = parseInt(sheetTxt.substr(pos, 25));
		if (isNaN(val) || val <= 0) {
			return -1;
		}
		return val;
	}
		
	self.beQuiet = function(bool) {
		if (typeof bool == 'undefined') {
			self.shouldBeQuiet = true;
		} else {
			self.shouldBeQuiet = bool;
		}
		return self;
	}

	self.getDeviceFromWindowWidth = function(screenWidth) {
		if (screenWidth < 481) {
			return 'mobile';
		}
		if (screenWidth < 769) {
			return 'tablet';
		}
		return 'desktop';
	}

	self.loadSubSheet = function(device) {
		// todo: this function assumes all the less framework subsheets are in one css file or one embedded style sheet.
		if (!self.refs.styleSheetRec) {
			self.refs.styleSheetRec = self.getStyleSheetRec();
			if (!self.refs.styleSheetRec) {
				self.reportError(self.consts.msgs.couldNotFindStyleSheet);	
				return false;
			}
		}	
		self.data.device = device;
		if (!self.refs.sheet) {
			self.refs.sheet = self.refs.styleSheet.loadCss(self.refs.styleSheetRec.cssText);
			if (self.refs.sheet.errorStr) {
				self.reportError(self.consts.msgs.couldNotParseCssText);	
				return false;
			}
		}
		self.refs.subSheet = self.findCorrectSubSheet(device);
		if (!self.refs.subSheet) {
			self.reportError(self.consts.msgs.couldNotFindMatchingMediaQueryStyleSheet);
			return false;
		}
		return true;
	}

	self.loadRule = function(device, selector) {
		if (!self.loadSubSheet(device)) {
			return false; // loadSubSheet informs the user of errors.
		}
		self.refs.rule = self.refs.sheet.getRule(self.refs.subSheet, selector);
		return self.refs.rule != null;
	}

	self.setProperty = function(rule, inProperty, inValue) {
		return self.setProperties(rule, [ { property: inProperty, value: inValue } ] );
	}

	self.setProperties = function(rule, declarations) {
		// declarations is an array of objects: [{property, value}]
		for (var i = 0; i < declarations.length; i++) {
			self.refs.sheet.setProperty(rule, declarations[i].property, declarations[i].value);
		}
		return true;
	}

	self.reportError = function(str) {
		if (!self.shouldBeQuiet) {
			self.alert(str);
		}
	}
		
	self.alert = function(str) {
		alert(str);
	}

	self.getStyleSheetRec = function() {
		if (self.refs.styleSheetRec) {
			return self.refs.styleSheetRec;
		}		
		var styleSheetRec = self.getEmbeddedStyleSheetRec();
		if (styleSheetRec) {
			self.refs.styleSheetRec = { type: 'embedded', styleElem: styleSheetRec.styleElem, cssText: styleSheetRec.cssText };
		} else {
			styleSheetRec = self.getAttachedStyleSheetRec();
			if (styleSheetRec) {
				self.refs.styleSheetRec = { type: 'attached', fileUrl: styleSheetRec.fileUrl, cssText: styleSheetRec.cssText };
			}
		}			
		return self.refs.styleSheetRec; // Could be null.
	}

	self.getEmbeddedStyleSheetRec = function() {
		var styleElems = self.refs.dom.getElementsByTagName('style');
		for (var i = 0; i < styleElems.length; i++) {
			var cssText = styleElems[i].innerHTML;
			if (self.isLessFrameworkStyleSheet(cssText)) {
				return { styleElem: styleElems[i], cssText: cssText };
			}
		}
		return null;
	}

	self.getAttachedStyleSheetRec = function() {
		var depFiles = self.refs.dom.getDependentFiles();
		for (var i = 0; i < depFiles.length; i++) {	
			var fileUrl = depFiles[i];
			try { 
				if (!fileUrl.isOfFileType('css')) {
					continue;
				}	
			} catch (e) {
				// fileUrl might not have any properties for some reason.
				continue;	
			}
			var cssText = '';		
			// todo
			//if (!makeStyleFileWritable(fileUrl))	
			//{
			//	window.close();
			//	return;	
			//}
			try {
				var dom = self.refs.dw.getDocumentDOM(fileUrl);
			} catch(e) {
				dom = null;
			}
			if (dom) {		
				cssText = dom.documentElement.outerHTML;
			}
			else {
				continue;
			}
			if (self.isLessFrameworkStyleSheet(cssText)) {
				return { fileUrl: fileUrl, cssText: cssText };
			}
		}		
		return null;
	}

	self.isLessFrameworkStyleSheet = function(cssText) {
		return typeof cssText == 'string' && cssText.indexOf('dw-num-cols-desktop') != -1; 
	}

	self.updateCss = function(stringRefObj) {
		if (!self.refs.styleSheetRec || !self.refs.sheet || !self.refs.subSheet) {
			return;
		}
		var cssText = stringRefObj ? stringRefObj.theString : self.refs.sheet.toString();
		if (self.refs.styleSheetRec.type == 'embedded') {
			self.refs.styleSheetRec.styleElem.innerHTML = cssText;
		} else if (self.refs.styleSheetRec.type == 'attached') {
			var fileUrl = self.refs.styleSheetRec.fileUrl;
			var relatedDocsEnabled = self.refs.dw.getPreferenceString("General Preferences", "Show Related Docs", "TRUE") == "TRUE";
			var dom = self.refs.dw.getDocumentDOM(fileUrl);
			if (dom) {
				if (!self.refs.dwscripts.fileIsCurrentlyOpen(fileUrl) && !relatedDocsEnabled) {
					var htmlFileDom = self.refs.dw.getDocumentDOM();
					dom = self.refs.dw.openDocument(fileUrl);
					self.refs.dw.setActiveWindow(htmlFileDom, true, true);
				}
				dom.documentElement.outerHTML = cssText;
			}
		}
	}

	self.findCorrectSubSheet = function(device) {
		var map = { 'mobile': 0, 'tablet': 1, 'desktop': 2 };
		return self.refs.sheet.getSubSheets()[map[device]];
	}	
	
	self.reset = function() {
		self.refs.styleSheetRec = null;
		self.refs.sheet = null;
		self.refs.subSheet = null;
	}
		
	self.insertRule = function(selector, startsNewRow) {
		for (var i = 0; i < self.consts.devices.length; i++) {
			var device = self.consts.devices[i];			
			if (!self.loadSubSheet(device)) {
				return;
			}			
			var ruleText = self.getCssToInsert(device, selector, startsNewRow);
			self.refs.sheet.appendRule(self.refs.subSheet, ruleText, 'saveEditRecOnly');	
		}
		var stringRefObj = {theString: self.refs.sheet.getTextAfterApplyingEdits()};
		self.updateCss(stringRefObj);
	}
	
	self.getCssToInsert = function(device, selector, startsNewRow) {
		var clear = startsNewRow ? 'both' : 'none';
		var marginLeft = startsNewRow ? '0' : self.calcCssMarginLeftFromColShift(device, 0, startsNewRow);
		var width = '100%';
		var declarations = 'clear:CLEAR;float:left;margin-left:MARGIN_LEFT;width:WIDTH;display:block;'
			.replace(/CLEAR/, 		clear)
			.replace(/MARGIN_LEFT/, marginLeft)
			.replace(/WIDTH/, 		width);
		var css = 'ID { DECLARATIONS }'
			.replace(/ID/, 				selector)
			.replace(/DECLARATIONS/, 	declarations);
		return css;
	}
	
	self.calcCssWidthFromColSpan = function(device, colSpan) {
		var offsetWidth = colSpan * self.data.colWidth + (colSpan - 1) * self.data.gutterWidth;  
		return self.percentFormat(offsetWidth / self.data.allColsWidth[device]) + '%';
	}	
		
	self.calcCssMarginLeftFromColShift = function(device, colShift, startsNewRow) {
		var gutterSpan = colShift;
		if (!startsNewRow) {
			gutterSpan++;
		}
		var marginLeft = colShift * self.data.colWidth + gutterSpan * self.data.gutterWidth;  
		marginLeft = self.percentFormat(marginLeft / self.data.allColsWidth[device]);
		return marginLeft + (marginLeft == 0 ? '' : '%');
	}
	
	self.getGutterCssWidth = function(device, gutterPosition) {
		var padding = self.data.gutterWidth;
		if( gutterPosition == "outer" )
			 padding = padding * 0.5;
		padding = self.percentFormat(padding / self.data.allColsWidth[device]);
		return padding + (padding == 0 ? '' : '%');
	}
	
	self.percentFormat = function(num) {
		return Math.floor(num * 1000000)/10000;  // Floor after four decimal places.
	}
					
	self.calcMarginOfError = function(device) {
		var effectiveColCount = Math.max(0, self.data.maxNumCols[device]);
		return effectiveColCount * 2;
	}			
		
	self.setColSpan = function(device, selector, colSpan) {
		self.reset(); // Make sure we have the latest css.
		if (!self.loadRule(device, selector)) {
			return;
		}
		self.updateUserCssProperty(
			self.refs.rule,
			'width', 
			self.calcCssWidthFromColSpan(device, colSpan)
		);
	}
		
	self.setColShift = function(device, selector, colShift) {
		self.reset(); // Make sure we have the latest css.
		if (!self.loadRule(device, selector)) {
			return;
		}
		var startsNewRow = self.startsNewRow(self.refs.rule);
		self.updateUserCssProperty(
			self.refs.rule,
			'margin-left', 
			self.calcCssMarginLeftFromColShift(device, colShift, startsNewRow)
		);
	}
		
	self.toggleStartsNewRow = function(device, selector) {
		self.reset(); // Make sure we have the latest css.
		if (!self.loadRule(device, selector)) {
			return;
		}
		var startsNewRow = self.startsNewRow(self.refs.rule);
		var colShift = self.getColShift(self.refs.rule, startsNewRow);
		if (colShift == -1) {
			return;
		}
		// Toggle values.
		var clearValue = startsNewRow ? 'none' : 'both';
		var marginLeftValue = self.calcCssMarginLeftFromColShift(device, colShift, !startsNewRow);
		self.updateUserCssProperties(
			self.refs.rule,
			[	{ property: 'margin-left', 	value: marginLeftValue },
				{ property: 'clear', 		value: clearValue }
			]
		);
	}
	
	self.startsNewRow = function(rule) {
		return self.refs.sheet.getProperty(rule, 'clear') == 'both';
	}
		
	self.getColShift = function(rule, startsNewRow) {
		var marginLeft = self.refs.sheet.getProperty(rule, 'margin-left');
		for (var i = 0; i < self.data.maxNumCols[self.data.device]; i++) {
			var testMarginLeft = self.calcCssMarginLeftFromColShift(self.data.device, i, startsNewRow);
			if (testMarginLeft == marginLeft) {
				return i;
			}
		}		
		return -1;
	}
		
	self.updateUserCssProperties = function(rule, declarations) {
		// declarations is an array of objects: [{property, value}]
		self.setProperties(rule, declarations);
		self.updateCss(); 
	}
		
	self.updateUserCssProperty = function(rule, inProperty, inValue) {
		self.updateUserCssProperties(rule, [ { property: inProperty, value: inValue } ]);
	}		
	
	self.getValidLayoutWidthPcts = function(device) {
		var numCols = self.data.maxNumCols[device];
		var widths = [];
		for (var colSpan = 1; colSpan <= numCols; colSpan++) {
			widths.push(self.calcCssWidthFromColSpan(device, colSpan));
		}
		return widths;
	}
}

