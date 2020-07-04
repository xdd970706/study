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
// FUNCTION:
//   getTranslatorInfo
//
// DESCRIPTION:
//   This function defines the translator's properties
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (array) - the translators properties
//--------------------------------------------------------------------
function getTranslatorInfo() {
  returnArray = new Array(7);

  returnArray[0] = "ICE_REGION"    // The translatorClass
  returnArray[1] = "ICE Region"    // The title
  returnArray[2] = "0"             // The number of extensions. 0 indicates to run against all extensions
  returnArray[3] = "1"             // The number of expressions"
  returnArray[4] = "ice:"          // The number of expressions"
  returnArray[5] = "byString"      // Run if doc contains expr
  returnArray[6] = "50"            // priority order to apply translator

  return returnArray;
} // getTranslatorInfo()


//--------------------------------------------------------------------
// FUNCTION:
//   translateDOM
//
// DESCRIPTION:
//   This function translates the given DOM node
//
// ARGUMENTS:
//   dom
//   sourceStr
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function translateDOM(dom, sourceStr) {
  if( typeof dom == "undefined" ) {
    return;
  }

  translateRegionsInDOM(dom, sourceStr);
}


//--------------------------------------------------------------------
// FUNCTION:
//   translateRegionsInDOM
//
// DESCRIPTION:
//   A common function for translating widgets in the DOM. They don't
//   have to be spry widgets as long as they follow the same coding
//   convetions. The main difference in translators is the regex to
//   find your widgets and your constructors.
//
// ARGUMENTS:
//   dom
//   origSourceStr
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function translateRegionsInDOM(dom, origSourceStr) {
  if (typeof dom == "undefined") {
    return;
  }

  dw.useTranslatedSource(true);

  // Translate all supported regions
  translateRegionsByType(dom, ICEUtils.editableRegionAttrName);
  translateRegionsByType(dom, ICEUtils.repeatingRegionAttrName);
  translateRegionsByType(dom, ICEUtils.repeatingRegionsGroupAttrName);
}


//--------------------------------------------------------------------
// FUNCTION:
//   translateRegionsByType
//
// DESCRIPTION:
//   This function translates all the regions form the given dom of a
//   specific type.
//
// ARGUMENTS:
//   dom (DOM object) - the current dom
//   regionAttrName (string) - the attribute name for the given
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function translateRegionsByType(dom, regionAttrName) {
  // Get all the regions of the gievn type
  var regions = dom.getElementsByAttributeName(regionAttrName);

  // For all the regions if given type we set the appropriate settings
  for (var i=0; i<regions.length; i++) {
    var ele = regions[i];

    if (typeof ele != "undefined") {
      // Set the translated attributes
      setTranslatedAttributes(ele, regionAttrName);

      // Add a delete handler for this region to remove the constructor
      var deleteFunction = getDeleteFunction();
      ele.addEventListener( "DOMNodeRemovedFromDocument", deleteFunction , false );

      // Add a insert handler for this region to remove the constructor
      var insertFunction = getInsertFunction();
      ele.addEventListener( "DOMNodeInsertedIntoDocument", insertFunction , false );
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getDeleteFunction
//
// DESCRIPTION:
//   This function returns the function that gets called whenever a
//   node is deleted. We need to create the function in it's own function
//   so the closure is clear.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (function) - the callback function called when a node is deleted
//--------------------------------------------------------------------
function getDeleteFunction() {
  var deleteFunction = function(e) {
    var targetDom = e.target.ownerDocument;
    var scriptTags = targetDom.getElementsByTagName("script");
    ICEUtils.removeScriptTag(targetDom, [e.target]);
    ICEUtils.removeICENamespace(targetDom, [e.target]);
  };

  return deleteFunction;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getInsertFunction
//
// DESCRIPTION:
//   This function returns the function that gets called whenever a
//   node is inserted. We need to create the function in it's own
//   function so the closure is clear.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (function) - the callback function called when a node is inserted
//--------------------------------------------------------------------
function getInsertFunction() {
  var insertFunction = function(e) {
    var targetDom = e.target.ownerDocument;

    ICEUtils.addICENamespace(targetDom);
    ICEUtils.copyICERegionsAssets(targetDom);
  };

  return insertFunction;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setTranslatedAttributes
//
// DESCRIPTION:
//   This function sets all the requires translated attributes for the
//   current node
//
// ARGUMENTS:
//   ele (HTML control) - the element to be translated
//   regionAttrName (string) - the type of the region identified by
//                             its attribute name
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function setTranslatedAttributes(ele, regionAttrName) {
  if (!ele) {
    return;
  }

  var outline = "";
  var regionType = "";

  // Display a human readable caption
  switch (regionAttrName) {
    case ICEUtils.editableRegionAttrName:
      regionType = ICEUtils.typeEditableRegion;
      outline = dw.loadString("ice/editableRegion/shortTitle");
      break;
    case ICEUtils.repeatingRegionAttrName:
      regionType = ICEUtils.typeRepeatingRegion;
      outline = dw.loadString("ice/repeatingRegion/shortTitle");
      break;
    case ICEUtils.repeatingRegionsGroupAttrName:
      regionType = ICEUtils.typeRepeatingRegionsGroup;
      outline = dw.loadString("ice/repeatingRegionsGroup/shortTitle");
      break;
  }

  if (outline != "") {
    // Add attributes to the main element for tabbedoutlines
    ele.setTranslatedAttribute("outline", outline);
    ele.setTranslatedAttribute("outlineId", "unique");
    ele.setTranslatedAttribute("outlineForSelection", "outlineForSelection");
    ele.setTranslatedAttribute("hiliteChildrenOnSelect", "false");

    // Leave a marker for the PI to know it can inspect this selection
    ele.setTranslatedAttribute(regionType, "true");
  }
}

