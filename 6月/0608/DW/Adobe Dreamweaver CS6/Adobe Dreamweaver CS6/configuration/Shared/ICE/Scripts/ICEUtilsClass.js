/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2008 Adobe Systems Incorporated
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
* AdobePatentID="B564"
* AdobePatentID="B565"
*
**************************************************************************/


//--------------------------------------------------------------------
// CLASS:
//   ICEUtils
//
// DESCRIPTION:
//   A collection of general functions
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICEUtils = function() {
  throw ("ICEUtils is a static class.");
};

ICEUtils.registerExtensionId				        = "ICERegisterSite";
ICEUtils.allowedEditableTags                = ["DIV", "TD", "TH"/*, "MMTEMPLATE:EDITABLE"*/];
ICEUtils.allowedRepeatingTags               = ["A", "ABBR", "ACRONYM", "ADDRESS", "B", "BIG", "BLOCKQUOTE", "CENTER", "CITE", "CODE", "DD", "DFN", "DIR", "DIV", "DL", "DT", "EM", "FONT", "H1", "H2", "H3", "H4", "H5", "H6", "HR", "I", "IMG", "INS", "KBD", "LABEL", "LI", "MENU", "OL", "P", "PRE", "Q", "S", "SAMP", "SMALL", "SPAN", "STRIKE", "STRONG", "SUB", "SUP", "TABLE", "TBODY", "TR", "TT", "U", "UL", "VAR"/*, "MMTEMPLATE:REPEAT"*/];
ICEUtils.allowedRepeatingRegionsGroupTags   = ["DIV", "LI", "OL", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "UL"];
ICEUtils.innerTagNames                      = ["THEAD", "TBODY", "TFOOT", "TR", "TD", "TH", "LI"]; // Nodes that have only one node type as valid parent
ICEUtils.doNotAllowDivChild                 = ["A", "ABBR", "ACRONYM", "B", "BASEFONT", "BDO", "BIG", "BR", "CITE", "CODE", "DFN", "EM", "FONT", "I", "IMG", "INPUT", "KBD", "LABEL", "Q", "S", "SAMP", "SELECT", "SMALL", "SPAN", "STRIKE", "STRONG", "SUB", "SUP", "TEXTAREA", "TT", "U", "VAR", "P", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "UL", "OL"];
ICEUtils.typeEditableRegion                 = "ICE.Region.EditableRegion";
ICEUtils.editableRegionAttrName             = "ice:editable";
ICEUtils.editableRegionAttrDefValue         = "*";
ICEUtils.editableRegionAttrAllValue         = ICEUtils.editableRegionAttrDefValue;
ICEUtils.typeRepeatingRegion                = "ICE.Region.Repeating";
ICEUtils.repeatingRegionAttrName            = "ice:repeating";
ICEUtils.repeatingRegionAttrDefValue        = "true";
ICEUtils.typeRepeatingRegionsGroup          = "ICE.Region.RepeatingGroup";
ICEUtils.repeatingRegionsGroupAttrName      = "ice:repeatinggroup";
ICEUtils.repeatingRegionsGroupAttrDefValue  = "*";
ICEUtils.repeatingRegionsGroupAttrAllValue  = ICEUtils.repeatingRegionsGroupAttrDefValue;
ICEUtils.includedJSFilePath                 = "/ice/ice.js";
ICEUtils.SITE_INCLUDES_DW_PATH              = "Shared/ICE/site-includes/";
ICEUtils.ICE_NAMESPACE                      = "http://ns.adobe.com/incontextediting";
ICEUtils.ICE_NAMESPACE_ATTRIBUTE            = "xmlns:ice";
ICEUtils.BEGIN_TEMPLATE_REGION_REGEXP       = /\<\!\-\-\s*TemplateBegin(?:If|Editable|Repeat)[^\-]*\-\-\>/gi;
ICEUtils.END_TEMPLATE_REGION_REGEXP         = /\<\!\-\-\s*TemplateEnd(?:If|Editable|Repeat)\s*\-\-\>/gi;


// Selection-related flags
ICEUtils.NODE_UNSUPPORTED = 1; // Node is not in the list of supported tags
ICEUtils.NODE_INVALID = 2; // Any of the following wil also set the invalid flag
ICEUtils.NODE_SERVER_SIDE = 4; // Nodes containing server-side code (e.g. PHP, CF, ASP etc.) & Text nodes inside server-side blocks of code (e.g. after "<?php" and before "?>")
ICEUtils.NODE_CONTAINS_ICE_EDITABLE = 8; // Nodes containing ICE Repeating Regions
ICEUtils.NODE_CONTAINS_ICE_REPEATING = 16; // Nodes containing ICE Repeating Regions
ICEUtils.NODE_CONTAINS_ICE_REPREGGROUP = 32; // Nodes containing ICE Repeating Regions Groups
ICEUtils.NODE_INSIDE_ICE_EDITABLE = 64; // Nodes contained in an ICE Editable Region
ICEUtils.NODE_INSIDE_ICE_REPEATING = 128; // Nodes contained in an ICE Repeating Region
ICEUtils.NODE_INSIDE_ICE_REPREGGROUP = 256; // Nodes contained in an ICE Repeating Regions Group
ICEUtils.NODE_ALREADY_ICE_EDITABLE = 512; // Nodes already transformed into ICE Editable Region
ICEUtils.NODE_ALREADY_ICE_REPEATING = 1024; // Nodes already transformed into ICE Editable Region
ICEUtils.NODE_ALREADY_ICE_REPREGGROUP = 2048; // Nodes already transformed into ICE Repeating Regions Group
ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION = 4096; // Nodes outside of a standard Deamweaver templates (.dwt) editable region
ICEUtils.NODE_IS_DWT_EDITABLE_REGION = 8192; // Nodes is a standard Deamweaver templates (.dwt) editable region
ICEUtils.NODE_IS_DWT_REPEATING_REGION = 16384; // Nodes is a standard Deamweaver templates (.dwt) repeating region
ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD = 32768; // Node is inside a parent which doesn't support the insertion of a DIV (it is a P or a inline element most probably)


//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   This function displays the ICE help page for the given help ID
//
// ARGUMENTS:
//   helpID (string) - the help ID to be displayed
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICEUtils.displayHelp = function(helpID) {
  dwscripts.displayDWHelp(helpID);
}

//--------------------------------------------------------------------
// FUNCTION:
//   showGettingStarted
//
// DESCRIPTION:
//   This function is called when user clicks the "Get started with
//   InContext Editing" link form the ICE PIs. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICEUtils.showGettingStarted = function() {
	var url = dw.loadString("ice/common/gettingStartedLink");
  dw.browseDocument(url);
}

//--------------------------------------------------------------------
// FUNCTION:
//   canInsertRegion
//
// DESCRIPTION:
//   This function verify if we can insert specified ICE region
//
// ARGUMENTS:
//   dom - object - current document dom
//
// RETURNS:
//   boolean - true if specified region can be inserted, false otherwise
//--------------------------------------------------------------------
ICEUtils.canInsertRegion = function(dom) {
  var errStr = "";

  if (!errStr && !ICEUtils.selectionIsInBody(dom)) {
    errStr = dwscripts.sprintf(dw.loadString("ice/common/messages/selectionNotInBody"));
  }

  if (!errStr && !dom.isHeadEditable()) {
    errStr = dwscripts.sprintf(dw.loadString("ice/common/messages/lockedHeadRegion"), dom.getAttachedTemplate());
  }

  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   copyICERegionsAssets
//
// DESCRIPTION:
//   This function copies all assets needed by ICE region into site and adds
//   references to added files to HEAD section of the page (if they are not
//   already there).
//
// ARGUMENTS:
//   dom (DOM object) - the DOM of the page where the assets will be added
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICEUtils.copyICERegionsAssets = function(dom) {
  var dwPath = ICEUtils.ensureTrailingSlash(dw.getConfigurationPath()) + ICEUtils.SITE_INCLUDES_DW_PATH;

  var filesArr = ICEUtils.getAssetsFiles(dwPath, "includes");
  var assetList = new Array();
  var fileType;

  for (var i=0; i<filesArr.length; i++) {
    fileType = (filesArr[i].match(new RegExp(dwscripts.escRegExpChars(ICEUtils.includedJSFilePath) + "$", "gi")) ? "javascript" : "");
    assetList.push(new AssetInfo(ICEUtils.SITE_INCLUDES_DW_PATH + filesArr[i], filesArr[i], fileType, false));
  }

  dom.copyAssets(assetList);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getAssetsFiles
//
// DESCRIPTION:
//   This function retrieves all files from a folder recursively.
//
// ARGUMENTS:
//   basefolder (string) - the starting folder
//   subfolder (string) - (optional) the subfolder inside the basefolder
//
// RETURNS:
//   (array) - list of files (paths are relative to basefolder)
//--------------------------------------------------------------------
ICEUtils.getAssetsFiles = function(basefolder, subfolder) {
  var files = new Array();
  var tempBasefolder = ICEUtils.ensureTrailingSlash(basefolder);
  var tempSubfolder = ((typeof(subfolder) == "string" && subfolder.length) ? ICEUtils.ensureTrailingSlash(subfolder) : "");

  var folders = DWfile.listFolder(tempBasefolder + tempSubfolder, "directories");

  // Recursively add the folders content
  for (var i=0; i<folders.length; i++) {
    files = files.concat(ICEUtils.getAssetsFiles(tempBasefolder, tempSubfolder + folders[i]));
  }

  var tempFiles = DWfile.listFolder(tempBasefolder + tempSubfolder, "files");
  for (var i=0; i<tempFiles.length; i++) {
    files.push(tempSubfolder + tempFiles[i]);
  }

  return files;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ensureTrailingSlash
//
// DESCRIPTION:
//   This function adds a forward slash at the end of the given path
//   if found missing.
//
// ARGUMENTS:
//   path (string) - the path to ensure the trailing slash
//
// RETURNS:
//   (string) - the new path with trailing slash
//--------------------------------------------------------------------
ICEUtils.ensureTrailingSlash = function(path) {
  var newPath = path;
  newPath += "/";
  newPath = newPath.replace(/\/\/$/gi, "/");

  return newPath;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isSavedDocument
//
// DESCRIPTION:
//   This function checks to see whethe or not the current page is saved
//   In case of unsaved page the user is proposed to save the page.
//
// ARGUMENTS:
//   theDOM (DOM Object) - the current page DOM
//
// RETURNS:
//   (boolean) - true if the document is saved, false otherwise
//--------------------------------------------------------------------
ICEUtils.isSavedDocument = function(theDOM) {
  var retVal = false;

  if (theDOM.URL == "") {
    retValue = false;
    if (confirm(dw.loadString("ice/common/messages/saveFile"))) {
      if (dw.canSaveDocument(dw.getDocumentDOM())) {
        dw.saveDocument(dw.getDocumentDOM());
      }
    }
  }

  if (theDOM.URL != "") {
    retVal = true;
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   removeScriptTag
//
// DESCRIPTION:
//   This function removes the InContext Editing links form the head of
//   the page if page has no InContext Editing functionalitied applied
//   anymore
//
// ARGUMENTS:
//   dom (DOM object) - the DOM of the page to check
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICEUtils.removeScriptTag = function(dom, ignoreElements) {
  if (!ICEUtils.pageContainsInContextEditingFeatures(dom, ignoreElements)) {
    var scriptNode;
    var arrScriptTags = dom.getElementsByTagName("script");
    if (arrScriptTags.length) {
      for (var i=0; i<arrScriptTags.length; i++) {
        var srcAttribute = arrScriptTags[i].getAttribute("src");
        if (srcAttribute &&  srcAttribute.indexOf(ICEUtils.includedJSFilePath) != -1) {
          var parentNode = arrScriptTags[i].parentNode;
          if (parentNode) {
            // If we are on a page created based on a DWT Template and the parent node of the SCRIPT node is not a DW Template
            // editable instance we should display a warning and not try to remove the SCRIPT because it will throw and error
            if (!dom.getAttachedTemplate() || (ICEUtils.isNodeStandardEditableInstance(parentNode))) {
              arrScriptTags[i].outerHTML = "";
            } else {
              alert(dw.loadString("ice/common/messages/removeRegion/lockedHeadRegion"));
            }
          }
          break;
        }
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   pageContainsInContextEditingFeatures
//
// DESCRIPTION:
//   This function looks for the existence of at least one InContext
//   Editing functionality on the given page.
//
// ARGUMENTS:
//   dom (DOM object) - the DOM of the page to check
//   ignoreElements (array of HTML objects) - (optional) the list of
//                          element that should be ignored by the check
//                          usefull when function is called form within the PI
//
// RETURNS:
//   (boolean) - true of the pagse has some InContext Editing
//               functionalities applied, false otherwise
//--------------------------------------------------------------------
ICEUtils.pageContainsInContextEditingFeatures = function(dom, ignoreElements) {
  var retValue = false;
  var arrNodes = new Array();

  arrNodes = arrNodes.concat(dom.getElementsByAttributeName(ICEUtils.editableRegionAttrName));
  arrNodes = arrNodes.concat(dom.getElementsByAttributeName(ICEUtils.repeatingRegionAttrName));
  arrNodes = arrNodes.concat(dom.getElementsByAttributeName(ICEUtils.repeatingRegionsGroupAttrName));

  if (arrNodes && arrNodes.length) {
    for (var i=0; i<arrNodes.length; i++) {
      if (!ignoreElements || (dwscripts.findInArray(ignoreElements, arrNodes[i]) == -1)) {
        retValue = true;
        break;
      }
    }
  }

  return retValue;
}


//-------------------------------------------------------------------
// FUNCTION:
//   selectionIsInBody
//
// DESCRIPTION:
//   This function looks for the current selection. If it is located
//   within the body tag, it will return TRUE, otherwise it will
//   return FALSE.
//
// ARGUMENTS:
//   dom (DOM object) - the DOM object of the current page
//
// RETURNS:
//   (boolean) - true if the selection is in the BODy, false otherwise
//--------------------------------------------------------------------
ICEUtils.selectionIsInBody = function(dom) {
  var retVal = false;

  dom = (dom != null) ? dom : dw.getDocumentDOM();

  if (dom) {
    var selObj = dom.source.getSelection();
    var bodyNodeOffsets = dom.nodeToOffsets(dom.body);

    if (selObj[0] >= bodyNodeOffsets[0] && selObj[1] < bodyNodeOffsets[1]) {
      retVal = true;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   nodeInsideLockedRegion
//
// DESCRIPTION:
//   This function determines if the specified node is inside a
//   template locked region.
//
// ARGUMENTS:
//   domParam - (object) document object
//   nodeParam - (object) document node
//
// RETURNS:
//   boolean - true if specified node is inside a locked region
//--------------------------------------------------------------------
ICEUtils.nodeInsideLockedRegion = function(domParam, nodeParam) {
  if (domParam && nodeParam) {
    var nodeOffsets = domParam.nodeToOffsets(nodeParam);
    if (nodeOffsets) {
      return domParam.rangeContainsLockedRegion(nodeOffsets[0], nodeOffsets[1]);
    }
  }

  return false;
};


//--------------------------------------------------------------------
// FUNCTION:
//   addICENamespace
//
// DESCRIPTION:
//   Adds the ICE namespace
//
// ARGUMENTS:
//   theDOM
//
// RETURNS:
//   (boolean) - true if the html node is found
//--------------------------------------------------------------------
ICEUtils.addICENamespace = function(theDOM) {
  if (typeof(theDOM) == "undefined") {
    theDOM = dw.getDocumentDOM();
  }

  var retValue = false;
  var htmlNodes = theDOM.getElementsByTagName("html");

  if (htmlNodes && htmlNodes.length) {
    var theHTMLNode = htmlNodes[0];
    if (theHTMLNode) {
      var attrVal = theHTMLNode.getAttribute(ICEUtils.ICE_NAMESPACE_ATTRIBUTE);
      if (attrVal == null) {
        // The total no of characters that will be added by this function call in the page
        var length = ICEUtils.ICE_NAMESPACE.length + ICEUtils.ICE_NAMESPACE_ATTRIBUTE.length + 4; // 4 = one equal sign + 2 quotes + 1 space before the attr name

        // Read current selection beore the apply of the namespace. After applying
        // the namespace DW selects the entire BODY which is not what we expect.
        var selOffsets = theDOM.getSelection();
        selOffsets[0] += length;
        selOffsets[1] += length;

        //add the ice namespace attribute if not there
        theHTMLNode.setAttribute(ICEUtils.ICE_NAMESPACE_ATTRIBUTE, ICEUtils.ICE_NAMESPACE);

        // Restore the selection
        theDOM.setSelection(selOffsets[0], selOffsets[1]);
      }
      retValue = true;
    }
  }

  return retValue;
};


//--------------------------------------------------------------------
// FUNCTION:
//   removeICENamespace
//
// DESCRIPTION:
//   Remove the ICE namespace if there are no ICE markup that depends on it.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICEUtils.removeICENamespace = function(theDOM, ignoreElements) {
  if (typeof(theDOM) == "undefined") {
    theDOM = dw.getDocumentDOM();
  }

  if (!ICEUtils.pageContainsInContextEditingFeatures(theDOM, ignoreElements)) {
    var htmlNodes = theDOM.getElementsByTagName("html");

    if (htmlNodes && htmlNodes.length) {
      var theHTMLNode = htmlNodes[0];
      if (theHTMLNode) {
        var attrVal = theHTMLNode.getAttribute(ICEUtils.ICE_NAMESPACE_ATTRIBUTE);
        if (attrVal) {
          // We should try removing the namespace if and only if we are not editing a page created based on a DWT Template
          // or if the parent node is a DW Template editable instance (ohterwise it will throw and error)
          if (!theDOM.getAttachedTemplate() || (theHTMLNode.parentNode && ICEUtils.isNodeStandardEditableInstance(theHTMLNode.parentNode))) {
            // remove the ICE namespace
            theHTMLNode.removeAttribute(ICEUtils.ICE_NAMESPACE_ATTRIBUTE);

            // Move the selection to the beginning of the document (first char in the BODY tag). This behavior
            // is preferrable to the one default that selects the entore HTML node
            var bodyNodes = theDOM.getElementsByTagName("body");
            if (bodyNodes && bodyNodes.length) {
              var index = theDOM.documentElement.outerHTML.indexOf(bodyNodes[0].innerHTML);
              theDOM.setSelection(index, index);
            }
          }
        }
      }
    }
  }
};


//--------------------------------------------------------------------
// FUNCTION:
//   selectionIncludeTemplateMarkup
//
// DESCRIPTION:
//   This function checks to see whether or not the current selection
//   includes DW standard template markup
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICEUtils.selectionIncludeTemplateMarkup = function(selection) {
  return (selection.match(ICEUtils.BEGIN_TEMPLATE_REGION_REGEXP) || selection.match(ICEUtils.END_TEMPLATE_REGION_REGEXP));
};


//--------------------------------------------------------------------
// FUNCTION:
//   isNodeStandardEditable
//
// DESCRIPTION:
//   This function checks whether or not the given node is a standard
//   DW template editable region.
//
// ARGUMENTS:
//   node (HTML element) - the node to check
//
// RETURNS:
//   (boolean) - true if the node is a standard DW template editable
//               region, false otherwise
//--------------------------------------------------------------------
ICEUtils.isNodeStandardEditable = function(node) {
  var retVal = false;

  if (node) {
    retVal = (node.tagName && node.tagName.toUpperCase && (node.tagName.toUpperCase() == "MMTEMPLATE:EDITABLE"));
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isNodeStandardEditableInstance
//
// DESCRIPTION:
//   This function checks whether or not the given node is a standard
//   DW template editable region instance.
//
// ARGUMENTS:
//   node (HTML element) - the node to check
//
// RETURNS:
//   (boolean) - true if the node is a standard DW template editable
//               region instance, false otherwise
//--------------------------------------------------------------------
ICEUtils.isNodeStandardEditableInstance = function(node) {
  var retVal = false;

  if (node) {
    retVal = (node.tagName && node.tagName.toUpperCase && (node.tagName.toUpperCase() == "MMTINSTANCE:EDITABLE"));
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   isNodeStandardRepeating
//
// DESCRIPTION:
//   This function checks whether or not the given node is a standard
//   DW template repeating region.
//
// ARGUMENTS:
//   node (HTML element) - the node to check
//
// RETURNS:
//   (boolean) - true if the node is a standard DW template repeating
//               region, false otherwise
//--------------------------------------------------------------------
ICEUtils.isNodeStandardRepeating = function(node) {
  var retVal = false;

  if (node) {
    retVal = (node.tagName && node.tagName.toUpperCase && (node.tagName.toUpperCase() == "MMTEMPLATE:REPEAT"));
  }

  return retVal;
};


//--------------------------------------------------------------------
// FUNCTION:
//   isNodeStandardRepeatingInstance
//
// DESCRIPTION:
//   This function checks whether or not the given node is a standard
//   DW template repeating region instance.
//
// ARGUMENTS:
//   node (HTML element) - the node to check
//
// RETURNS:
//   (boolean) - true if the node is a standard DW template repeating
//               region instance, false otherwise
//--------------------------------------------------------------------
ICEUtils.isNodeStandardRepeatingInstance = function(node) {
  var retVal = false;

  if (node) {
    retVal = (node.tagName && node.tagName.toUpperCase && (node.tagName.toUpperCase() == "MMTINSTANCE:REPEAT"));
  }

  return retVal;
};


//--------------------------------------------------------------------
// FUNCTION:
//   isNodeStandardRepeatingEntry
//
// DESCRIPTION:
//   This function checks whether or not the given node is a standard
//   DW template repeating region entry.
//
// ARGUMENTS:
//   node (HTML element) - the node to check
//
// RETURNS:
//   (boolean) - true if the node is a standard DW template repeating
//               region entry, false otherwise
//--------------------------------------------------------------------
ICEUtils.isNodeStandardRepeatingEntry = function(node) {
  var retVal = false;

  if (node) {
    retVal = (node.tagName && node.tagName.toUpperCase && (node.tagName.toUpperCase() == "MMTINSTANCE:REPEATENTRY"));
  }

  return retVal;
};


//--------------------------------------------------------------------
// FUNCTION:
//   isNodeStandardOptional
//
// DESCRIPTION:
//   This function checks whether or not the given node is a standard
//   DW template optional region.
//
// ARGUMENTS:
//   node (HTML element) - the node to check
//
// RETURNS:
//   (boolean) - true if the node is a standard DW template optional
//               region, false otherwise
//--------------------------------------------------------------------
ICEUtils.isNodeStandardOptional = function(node) {
  var retVal = false;

  if (node) {
    retVal = (node.tagName && node.tagName.toUpperCase && (node.tagName.toUpperCase() == "MMTEMPLATE:IF"));
  }

  return retVal;
};


//--------------------------------------------------------------------
// FUNCTION:
//   canTransformParentNode
//
// DESCRIPTION:
//   This function decides whether we can transform the parent node of
//   the given tag or not. A value of TRUE will be retunred if and only
//   if the parent node is a VALID & SUPPORTED NODE (e,g, DIV, TD, TH)
//   and if the parent has only one child.
//
// ARGUMENTS:
//   dom (DOM obj) - the current DOM
//   theNode (DOM control obj) - the node to check
//   allowedTags (array of string) - list of nodes that are supported
//   ignoreFlags (number) - (optional) the set of flags that should be ignored
//
// RETURNS:
//   (Boolean) - true if the parent node is valid and supported, false otherwise
//--------------------------------------------------------------------
ICEUtils.canTransformParentNode = function(dom, theNode, allowedTags, ignoreFlags) {
  var retVal = false;

  if (theNode && theNode.parentNode) {
    var parentNode = theNode.parentNode;

    var parentProps = ICEUtils.checkNode(dom, parentNode, allowedTags, ignoreFlags);

    // The node must not be neither invalid nor unsupported => it must be valid & supported
    if (((parentProps & ICEUtils.NODE_UNSUPPORTED) == 0) && ((parentProps & ICEUtils.NODE_INVALID) == 0)) {
      retVal = true;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   checkNode
//
// DESCRIPTION:
//   This function analizes the given node and returns its properties as
//   a 10 bit number with flags.
//
// ARGUMENTS:
//   dom (DOM Object) - the current DOM object
//   node (DOM Object) - the node to check
//   allowedTags (array of string) - list of nodes that are supported
//   ignoreFlags (number) - (optional) the set of flags that should be ignored
//
// RETURNS:
//  (number) - the type of node
//--------------------------------------------------------------------
ICEUtils.checkNode = function(dom, node, allowedTags, ignoreFlags) {
  if (typeof(ignoreFlags) != "number") {
    ignoreFlags = 0;
  }

  var retVal = 0;
  var severSideRegExp = /(?:\<\?|\?\>|<cf\w+)/gi;
  var tempArr;

  // Node.ELEMENT_NODE == 1
  // Node.ATTRIBUTE_NODE == 2
  // Node.TEXT_NODE == 3
  // Node.CDATA_SECTION_NODE == 4
  // Node.ENTITY_REFERENCE_NODE == 5
  // Node.ENTITY_NODE == 6
  // Node.PROCESSING_INSTRUCTION_NODE == 7
  // Node.COMMENT_NODE == 8
  // Node.DOCUMENT_NODE == 9
  // Node.DOCUMENT_TYPE_NODE == 10
  // Node.DOCUMENT_FRAGMENT_NODE == 11
  // Node.NOTATION_NODE == 12

  if (node && (node.nodeType == Node.COMMENT_NODE)) { /* Node.COMMENT_NODE = 8 */
    // Check to see if the node is a Server Side node. DOM reports such nodes as comment nodes
    if (node.data && node.data.match && node.data.match(severSideRegExp)) {
      retVal = retVal | ICEUtils.NODE_SERVER_SIDE;
      retVal = retVal | ICEUtils.NODE_INVALID;
    }
  } else if (node && (node.nodeType == Node.TEXT_NODE)) { /* Node.TEXT_NODE = 3 */
    retVal = retVal | ICEUtils.NODE_UNSUPPORTED;
  }

  // Check to see if the body of the node contains server side code
  if (node && node.outerHTML && node.outerHTML.match && node.outerHTML.match(severSideRegExp)) {
    retVal = retVal | ICEUtils.NODE_SERVER_SIDE;
    retVal = retVal | ICEUtils.NODE_INVALID;
  }

  // Check to see if tag itself is a SCRIPT tag
  var tempNode = node;
  while (tempNode) {
    if (tempNode && tempNode.tagName && tempNode.tagName.toUpperCase && (tempNode.tagName.toUpperCase() == "SCRIPT")) {
      retVal = retVal | ICEUtils.NODE_SERVER_SIDE;
      retVal = retVal | ICEUtils.NODE_INVALID;
      break;
    }
    tempNode = tempNode.parentNode;
  }

  // Check to see whether or not one of the parent tags allows for DIV insertion
  if (!(ignoreFlags & ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD)) {
    var tempNode = node.parentNode;
    // If the node is a DWT Region then we will move to next parent node untill we reach a node that is not a DWT region. Then we will check that node.
    while (tempNode && (ICEUtils.isNodeStandardEditable(tempNode) || ICEUtils.isNodeStandardRepeating(tempNode) || ICEUtils.isNodeStandardOptional(tempNode) || ICEUtils.isNodeStandardEditableInstance(tempNode) || ICEUtils.isNodeStandardRepeatingInstance(tempNode) || ICEUtils.isNodeStandardRepeatingEntry(tempNode))) {
      tempNode = tempNode.parentNode;
    }
    if (tempNode.tagName && tempNode.tagName.toUpperCase && (dwscripts.findInArray(ICEUtils.doNotAllowDivChild, tempNode.tagName.toUpperCase()) != -1)) {
      retVal = retVal | ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD;
      retVal = retVal | ICEUtils.NODE_INVALID;
    }
  }

  /*****************/
  /** ICE regions **/
  /*****************/

  // Construct a new dom in which we will place the content of the current node. We do this
  // because if I'm calling the getElementsByAttributeName() on a node obj, it will return
  // nodes from the entire page, and not nodes contained only by the given node. So having this
  // in place will basically restrict the search of getElementsByAttributeName() to the current
  // node.
  var newDom = dw.getNewDocumentDOM();
  newDom.documentElement.outerHTML = node.innerHTML;

  // Look for ICE Editable Region nodes inside current node
  if (!(ignoreFlags & ICEUtils.NODE_CONTAINS_ICE_EDITABLE)) {
    tempArr = newDom.getElementsByAttributeName(ICEUtils.editableRegionAttrName);
    if (tempArr && tempArr.length) {
      retVal = retVal | ICEUtils.NODE_CONTAINS_ICE_EDITABLE;
      retVal = retVal | ICEUtils.NODE_INVALID;
    }
  }

  // Look for ICE Repeating Region nodes inside current node
  if (!(ignoreFlags & ICEUtils.NODE_CONTAINS_ICE_REPEATING)) {
    tempArr = newDom.getElementsByAttributeName(ICEUtils.repeatingRegionAttrName);
    if (tempArr && tempArr.length) {
      retVal = retVal | ICEUtils.NODE_CONTAINS_ICE_REPEATING;
      retVal = retVal | ICEUtils.NODE_INVALID;
    }
  }

  // Look for ICE Repeating Regions Group nodes inside current node
  if (!(ignoreFlags & ICEUtils.NODE_CONTAINS_ICE_REPREGGROUP)) {
    tempArr = newDom.getElementsByAttributeName(ICEUtils.repeatingRegionsGroupAttrName);
    if (tempArr && tempArr.length) {
      retVal = retVal | ICEUtils.NODE_CONTAINS_ICE_REPREGGROUP;
      retVal = retVal | ICEUtils.NODE_INVALID;
    }
  }

  // Check to see whether we have SCRIPT tags inside the region
  if (true) {
    tempArr = newDom.getElementsByTagName("script");
    if (tempArr && tempArr.length) {
      retVal = retVal | ICEUtils.NODE_SERVER_SIDE;
      retVal = retVal | ICEUtils.NODE_INVALID;
    }
  }

  // Check to see whether the node is already contained in an ICE Editable Region
  if (!(ignoreFlags & ICEUtils.NODE_INSIDE_ICE_EDITABLE)) {
    var tempNode = node.parentNode;
    while (tempNode) {
      if (tempNode.getAttribute && tempNode.getAttribute(ICEUtils.editableRegionAttrName)) {
        retVal = retVal | ICEUtils.NODE_INSIDE_ICE_EDITABLE;
        retVal = retVal | ICEUtils.NODE_INVALID;
        break;
      }
      tempNode = tempNode.parentNode;
    }
  }

  // Check to see whether the node is already contained in an ICE Repeating Region
  if (!(ignoreFlags & ICEUtils.NODE_INSIDE_ICE_REPEATING)) {
    var tempNode = node.parentNode;
    while (tempNode) {
      if (tempNode.getAttribute && tempNode.getAttribute(ICEUtils.repeatingRegionAttrName)) {
        retVal = retVal | ICEUtils.NODE_INSIDE_ICE_REPEATING;
        retVal = retVal | ICEUtils.NODE_INVALID;
        break;
      }
      tempNode = tempNode.parentNode;
    }
  }

  // Check to see whether the node is already contained in an ICE Repeating Regions Group
  if (!(ignoreFlags & ICEUtils.NODE_INSIDE_ICE_REPREGGROUP)) {
    var tempNode = node.parentNode;
    while (tempNode) {
      if (tempNode.getAttribute && tempNode.getAttribute(ICEUtils.repeatingRegionsGroupAttrName)) {
        retVal = retVal | ICEUtils.NODE_INSIDE_ICE_REPREGGROUP;
        retVal = retVal | ICEUtils.NODE_INVALID;
        break;
      }
      tempNode = tempNode.parentNode;
    }
  }

  // Check to see whether the node is already an ICE Editable Region
  if (!(ignoreFlags & ICEUtils.NODE_ALREADY_ICE_EDITABLE)) {
    if (node.getAttribute && node.getAttribute(ICEUtils.editableRegionAttrName)) {
      retVal = retVal | ICEUtils.NODE_ALREADY_ICE_EDITABLE;
      retVal = retVal | ICEUtils.NODE_INVALID;
    }
  }

  // Check to see whether the node is already an ICE Repeating Region
  if (!(ignoreFlags & ICEUtils.NODE_ALREADY_ICE_REPEATING)) {
    if (node.getAttribute && node.getAttribute(ICEUtils.repeatingRegionAttrName)) {
      retVal = retVal | ICEUtils.NODE_ALREADY_ICE_REPEATING;
      retVal = retVal | ICEUtils.NODE_INVALID;
    }
  }

  // Check to see whether the node is already an ICE Repeating Regions Group
  if (!(ignoreFlags & ICEUtils.NODE_ALREADY_ICE_REPREGGROUP)) {
    if (node.getAttribute && node.getAttribute(ICEUtils.repeatingRegionsGroupAttrName)) {
      retVal = retVal | ICEUtils.NODE_ALREADY_ICE_REPREGGROUP;
      retVal = retVal | ICEUtils.NODE_INVALID;
    }
  }

  /***************/
  /** TEMPLATES **/
  /***************/

  // Check to see whether the node is a standard Deamweaver templates (.dwt) Repeating region
  if (!(ignoreFlags & ICEUtils.NODE_IS_DWT_EDITABLE_REGION)) {
    if (dom && dom.getIsTemplateDocument()) {
      if (ICEUtils.isNodeStandardEditable(node)) {
        retVal = retVal | ICEUtils.NODE_IS_DWT_EDITABLE_REGION;
        retVal = retVal | ICEUtils.NODE_UNSUPPORTED;
      }
    }
  }

  // Check to see whether the node is a standard Deamweaver templates (.dwt) Repeating region
  if (!(ignoreFlags & ICEUtils.NODE_IS_DWT_REPEATING_REGION)) {
    if (dom && dom.getIsTemplateDocument()) {
      if (ICEUtils.isNodeStandardRepeating(node)) {
        retVal = retVal | ICEUtils.NODE_IS_DWT_REPEATING_REGION;
        retVal = retVal | ICEUtils.NODE_UNSUPPORTED;
      }
    }
  }

  // Check to see whether the node is outside of or contains more than one Deamweaver templates (.dwt) Repeating region
  if (!(ignoreFlags & ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION)) {
    if (dom && dom.getIsTemplateDocument()) {
      var tempNode = node;
      var isInsideDWTEditableRegion = false;
      while (tempNode) {
        if (ICEUtils.isNodeStandardEditable(tempNode)) {
          isInsideDWTEditableRegion = true;
          break;
        }
        if (tempNode.tagName && tempNode.tagName.toUpperCase && (tempNode.tagName.toUpperCase() == "BODY")) {
          break;
        }
        tempNode = tempNode.parentNode;
      }
      if (!isInsideDWTEditableRegion) {
        retVal = retVal | ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION;
        retVal = retVal | ICEUtils.NODE_INVALID;
      }
    }
  }

  // If the node is not in the allowed list then we should makr it as UNUSPPORTED and SKIPPED as well
  if (node && node.tagName && node.tagName.toUpperCase) {
    if (dwscripts.findInArray(allowedTags, node.tagName.toUpperCase()) == -1) {
      retVal = retVal | ICEUtils.NODE_UNSUPPORTED;
    }
  }

  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   debugNodeProps
//
// DESCRIPTION:
//   This function displays all the flags set for the current props value
//
// ARGUMENTS:
//   nodeProps (number) - the node props as returned bya call to ICEUtils.checkNode
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICEUtils.debugNodeProps = function (nodeProps) {
  var retStr = "";

  for (var i in ICEUtils) {
    if (i.match(/NODE_/g) && (typeof(ICEUtils[i]) == "number")) {
      if ((nodeProps & ICEUtils[i]) != 0) {
        retStr += "ICEUtils." + i + "\n";
      }
    }
  }

  alert(retStr);
}


//--------------------------------------------------------------------
// FUNCTION:
//   nodesToStr
//
// DESCRIPTION:
//   This function returns the outr HTML of all given nodes as a single
//   contigous selection
//
// ARGUMENTS:
//   dom (DOM Object) - the DOM of the page containing the given nodes
//   nodesArr (array of HTML objects) - the selected nodes
//
// RETURNS:
//   (string) - the outer HTML of the given nodes as a continous selection
//--------------------------------------------------------------------
ICEUtils.nodesToStr = function(dom, nodesArr) {
  var indexes = new Array();
  var selStr = "";

  if (nodesArr.length == 1 && nodesArr[0].nodeType == Node.TEXT_NODE) {
    indexes = dom.getSelection();
  } else {
    for (var i=0; i<nodesArr.length; i++) {
      indexes = indexes.concat(dom.nodeToOffsets(nodesArr[i]));
    }
  }
  indexes = indexes.sort();

  selStr = dom.documentElement.outerHTML.substr(indexes[0], indexes[indexes.length-1]-indexes[0]);

  return selStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getSelelectionAsArrayOfNodes
//
// DESCRIPTION:
//   This function returns the current selection more accurately. It
//   always returns an array of nodes => it supports multiple selection.
//   Also, in case of partial nodes selection, it expans the selection
//   to the outer-most node. Lats but not least it removes from the
//   resulting array the list of nodes contained by others from the
//   current result.
//
// ARGUMENTS:
//   dom (DOM Object) - the DOM which we are investogating
//
// RETURNS:
//   (array of DOM Elements) - the current selected nodes
//--------------------------------------------------------------------
ICEUtils.getSelelectionAsArrayOfNodes = function(dom) {
  var OPEN_TAG = "<body>";
  var CLOSE_TAG = "</body>";

  // Try to force a DOM refresh
  dwscripts.callCommand("fakeCommand");

  var retArr = new Array();
  var pageOffsets = dom.source.getSelection();

  if (pageOffsets && (pageOffsets[0] != pageOffsets[1])) {
    var page = dom.documentElement.outerHTML;
    var tempStr;

    var tempDOM = dw.getNewDocumentDOM();
    tempDOM.documentElement.outerHTML = OPEN_TAG + page.substr(pageOffsets[0], pageOffsets[1] - pageOffsets[0]) + CLOSE_TAG;
    var tempBody = tempDOM.getElementsByTagName(OPEN_TAG.replace(/[\<\>]/gi, ""))[0];

    indexes = new Array();

    matches = tempBody.innerHTML.match(/^[\s\t\r\n]+/gi);

    // Get the first index of a NON space character
    if (matches && matches[0]) {
      indexes.push(matches[0].length);
    } else {
      indexes.push(0);
    }

    // Go throught each of the child nodes and create some indexes
    for (var i=1; i<tempBody.childNodes.length; i++) {
      var oo1 = tempDOM.nodeToOffsets(tempBody.childNodes[i]);
      indexes.push(oo1[0] - OPEN_TAG.length - 1);
      indexes.push(oo1[0] - OPEN_TAG.length);
    }

    // The last inde xis the last index of the tempBody's inner HTML
    indexes.push(tempBody.innerHTML.length);

    for (var i=0; i<indexes.length; i+=2) {
      tempStr = tempBody.outerHTML.substr(indexes[i] + OPEN_TAG.length, indexes[i+1] - indexes[i]);
      tempStr = tempStr.replace(/[\s\t\r\n]+$/gi, "");
      indexes[i+1] = indexes[i] + tempStr.length - 1;

      retArr.push(dom.offsetsToNode(pageOffsets[0] + indexes[i], pageOffsets[0] + indexes[i+1]));
    }

    // See whether o rnot we have nodes contained within other nodes and mark them for removal (if any)
    var toRemoveArr = new Array();
    for (var i=0; i<retArr.length; i++) {
      for (var j=i; j<retArr.length; j++) {
        if (retArr[j].parentNode == retArr[i]) {
          toRemoveArr.push(j);
        }
        if (retArr[i].parentNode == retArr[j]) {
          toRemoveArr.push(i);
        }
      }
    }

    // make sure the IDs are sorted, so we can trustly go through them in the reversed order
    toRemoveArr = toRemoveArr.sort();

    // Remove each toRemoveArr index from the final array
    for (var i=toRemoveArr.length-1; i>=0; i--) {
      retArr.splice(toRemoveArr[i], 1);
    }
  } else {
    var node = dom.offsetsToNode(pageOffsets[0], pageOffsets[1]);
    //dom.setSelectedNode(node);
    retArr.push(node);
  }

  return retArr;
}

//--------------------------------------------------------------------
// FUNCTION:
//   siteIsICEfied
//
// DESCRIPTION:
//   Determines if a site contains documents ICE markup applied on them.   
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
ICEUtils.siteIsICEfied = function(theDOM) {
  // we will try to read the content of the document
  // to avoid some syncronization problems 
  var source = theDOM.source.getText();
  var searchPattern = dwscripts.escRegExpChars(ICEUtils.ICE_NAMESPACE_ATTRIBUTE) + "\\s*=\\s*(?:\"|')" + dwscripts.escRegExpChars(ICEUtils.ICE_NAMESPACE) +"(?:\"|')";
  
  if (source && source.match(RegExp(searchPattern, "i"))) {
    return true;
  }
  
  return false;
}
