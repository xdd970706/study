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
//   ICECreateRepeatingRegion
//
// DESCRIPTION:
//   This class is ...
//
// PUBLIC FUNCTIONS:
//   apply()
//   getUIOptions()
//   displayErrorForNodeProps()
//   applyToNode(node)
//   insertNew(dom)
//   wrapSelection(dom, nodesArr)
//   applyOnStandardRepeatingRegion(dom, node)
//   onBeforeApply(dom)
//   onAfterApply(dom)
//--------------------------------------------------------------------
function ICECreateRepeatingRegion() {
  throw ("ICECreateRepeatingRegion is a static class.");
}


//--------------------------------------------------------------------
// FUNCTION:
//   apply
//
// DESCRIPTION:
//   This function applies a InContext Repeating Region on the current
//   selection. If it i snot possible it will either display an error
//   message or ask the user confirmation for appling on other parent
//   nodes.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateRepeatingRegion.apply = function() {
  var currDOM = dw.getDocumentDOM();
  var currSel = ICEUtils.getSelelectionAsArrayOfNodes(currDOM);

  var nodeProps = 0;
  var theNode;
  var theProps;
  var allowGroupTransform = true;

  var DEFAULT_IGNORE_FLAGS = ICEUtils.NODE_INSIDE_ICE_REPREGGROUP | ICEUtils.NODE_ALREADY_ICE_EDITABLE | ICEUtils.NODE_CONTAINS_ICE_EDITABLE;

  for (var i=0; i<currSel.length; i++) {
    theNode = currSel[i];
    theProps = ICEUtils.checkNode(currDOM, theNode, ICEUtils.allowedRepeatingTags, DEFAULT_IGNORE_FLAGS);

    // If the current node is a standard DWT repeating region, then we should re-read the node props and
    // ignore the setting that it is outside of a DWT editable region.
    if (theProps & ICEUtils.NODE_IS_DWT_REPEATING_REGION) {
      theProps = ICEUtils.checkNode(currDOM, theNode, ICEUtils.allowedRepeatingTags, ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION | DEFAULT_IGNORE_FLAGS);

      // If the current selected node is a DWT Repeating Region and the only
      // child is a supported node then we will clear the unsupported, invalid
      // and parent do not allow div insertion flags.
      if (theNode.childNodes && theNode.childNodes.length == 1 && theNode.childNodes[0].tagName && dwscripts.findInArray(ICEUtils.allowedRepeatingTags, theNode.childNodes[0].tagName.toUpperCase()) != -1) {
        theProps = theProps & ~ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD;
        theProps = theProps & ~ICEUtils.NODE_UNSUPPORTED;
        theProps = theProps & ~ICEUtils.NODE_INVALID;
      }
    }

    // If the current node is supported, is not already a ICE Repeating Region and the parent node can also be transformed
    // into a repeating regions group (or it is already), then we will clear the invalid flag.
    if (((theProps & ICEUtils.NODE_UNSUPPORTED) == 0) && ((theProps & ICEUtils.NODE_ALREADY_ICE_REPEATING) == 0)) {
      if (ICEUtils.canTransformParentNode(currDOM, theNode, ICEUtils.allowedRepeatingRegionsGroupTags, ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD | ICEUtils.NODE_ALREADY_ICE_REPREGGROUP | ICEUtils.NODE_CONTAINS_ICE_REPEATING | ICEUtils.NODE_CONTAINS_ICE_EDITABLE)) {
        theProps = theProps & ~ICEUtils.NODE_INVALID; // Clear the INVALID flag
      }
    }

    // However, if the current selection is unsupported but the parent node can be transformed, then we will clear
    // the invalid flag for the current node (e.g. select some text inside a <p> - the text cannot be wrapped, but
    // the parent can be transformed into a repeating region)
    if ((theProps & ICEUtils.NODE_UNSUPPORTED) != 0) {
      if (ICEUtils.canTransformParentNode(currDOM, theNode, ICEUtils.allowedRepeatingTags)) {
        theProps = theProps & ~ICEUtils.NODE_INVALID; // Clear the INVALID flag
      }
    } else {
      // However, if the current tag is supported, then it will be transformed and we need to ake sure the parent
      // tag can be transformed into a repeating regions group
      if (ICEUtils.canTransformParentNode(currDOM, theNode, ICEUtils.allowedRepeatingRegionsGroupTags)) {
        theProps = theProps & ~ICEUtils.NODE_INVALID; // Clear the INVALID flag
      }
    }

    // If the selection is exactly a standard DW template editable region we will be considering this a invalid selection because it is outside of
    // a standard DW template editable region and doesn't contain exactly one standard DW template repeating region
    if (theProps & ICEUtils.NODE_IS_DWT_EDITABLE_REGION) {
      theProps = theProps | ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION;
      theProps = theProps | ICEUtils.NODE_INVALID;
    }

    if (theNode.tagName && theNode.tagName.toUpperCase && (dwscripts.findInArray(ICEUtils.innerTagNames, theNode.tagName.toUpperCase()) == -1)) {
      allowGroupTransform = false;
    }

    // If we have selected more than one node and at the current one (at least one) is a DWT Repeating
    // Region we'll consider the selection as being invalid
    if (currSel && (currSel.length > 1) && (theProps & ICEUtils.NODE_IS_DWT_REPEATING_REGION) != 0) {
      theProps = theProps | ICEUtils.NODE_INVALID;
      theProps = theProps | ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION;
    }

    nodeProps = nodeProps | theProps;
  }

  if ((currSel.length > 1) && !allowGroupTransform) {
    nodeProps = nodeProps | ICEUtils.NODE_UNSUPPORTED;
  }

  var selection = dw.getSelection();
  if (selection[0] == selection[1]) {
    nodeProps = ICEUtils.checkNode(currDOM, currSel[0], ICEUtils.allowedRepeatingTags, ICEUtils.NODE_ALREADY_ICE_REPEATING | ICEUtils.NODE_ALREADY_ICE_REPREGGROUP | ICEUtils.NODE_CONTAINS_ICE_REPEATING | DEFAULT_IGNORE_FLAGS);
    nodeProps = nodeProps | ICEUtils.NODE_UNSUPPORTED;

    // If the selection is exactly a standard DW template editable region we will be considering this a invalid selection because it is outside of
    // a standard DW template editable region and doesn't contain exactly one standard DW template repeating region
    if (nodeProps & ICEUtils.NODE_IS_DWT_EDITABLE_REGION) {
      nodeProps = nodeProps | ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION;
      nodeProps = nodeProps | ICEUtils.NODE_INVALID;
    }
  }

  //ICEUtils.debugNodeProps(nodeProps);

  if ((nodeProps & ICEUtils.NODE_INVALID) != 0) {
    // Display the appropriate error
    ICECreateRepeatingRegion.displayErrorForNodeProps(nodeProps);
  } else if (currSel && currSel.length && ((nodeProps & ICEUtils.NODE_UNSUPPORTED) == 0)) {
    // The selection does not include INVALID nor UNSUPPORTED nodes => we should transform each of the selected nodes directly
    for (var i=0; i<currSel.length; i++) {
      if (currSel[i] != null) {
        if (currDOM && currDOM.getIsTemplateDocument() && ICEUtils.isNodeStandardRepeating(currSel[i])) {
          ICECreateRepeatingRegion.applyOnStandardRepeatingRegion(currDOM, currSel[i]);
        } else {
          ICECreateRepeatingRegion.applyToNode(currSel[i]);
        }
      }
    }
  } else {
    var tempObj = new Object();
    tempObj.options = ICECreateRepeatingRegion.getUIOptions(currDOM, currSel);
    dwscripts.callCommand("ICERepeatingRegion.htm", tempObj);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getUIOptions
//
// DESCRIPTION:
//   This function builds the entire UI the final user will see based
//   on the current selection.
//
// ARGUMENTS:
//   currDOM (DOM Object) - the dom of the page
//   nodesArr (array of HTML objects) - the list of selected nodes
//
// RETURNS:
//   (OptionsDispatcher instance) - a OptionsDispatcher object instance
//--------------------------------------------------------------------
ICECreateRepeatingRegion.getUIOptions = function(currDOM, nodesArr) {
  var opts = new OptionsDispatcher("insert_options");
  opts.initialize();

  //---------------------------------------------------------
  var option1 = new Option();
  option1.setLabel(dw.loadString("ice/repeatingRegion/cmd/option/insertNew"));
  option1.setShowIf(function() {
    var selection = currDOM.getSelection();
    return (selection[0] == selection[1]);
  });
  option1.setEnabler(function() {
    return (!(ICEUtils.checkNode(currDOM, nodesArr[0], []) & ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD));
  });
  option1.apply = function () {
    ICECreateRepeatingRegion.insertNew(currDOM, true);
  }
  opts.addOption(option1);

  //---------------------------------------------------------
  var option2 = new Option();
  option2.setLabel(dw.loadString("ice/repeatingRegion/cmd/option/wrapSel"));
  option2.setShowIf(function() {
    var selection = currDOM.getSelection();
    return ((selection[0] < selection[1]) && (!currDOM.getIsTemplateDocument() || ICEUtils.isNodeStandardRepeating(nodesArr[0]) || !ICEUtils.selectionIncludeTemplateMarkup(ICEUtils.nodesToStr(currDOM, nodesArr))));
  });
  option2.setEnabler(function() {
    var nodeProps = ICEUtils.checkNode(currDOM, nodesArr[0], []);
    return (((nodeProps & ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD) == 0) && ((nodeProps & ICEUtils.NODE_IS_DWT_REPEATING_REGION) == 0));
  });
  option2.apply = function () {
    ICECreateRepeatingRegion.wrapSelection(currDOM, nodesArr, true);
  }
  opts.addOption(option2);

  //---------------------------------------------------------
  var option3 = new Option();
  option3.setLabel(dw.loadString("ice/repeatingRegion/cmd/option/transformParent"));
  option3.setShowIf(function() {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    return (!currDOM.getIsTemplateDocument() || (!ICEUtils.isNodeStandardRepeating(node) && !ICEUtils.isNodeStandardRepeating(node.parentNode)));
  });
  option3.setEnabler(function() {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    return ICEUtils.canTransformParentNode(currDOM, node, ICEUtils.allowedRepeatingTags);
  });
  option3.apply = function () {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    ICECreateRepeatingRegion.applyToNode(node.parentNode, false, false, true);
  }
  opts.addOption(option3);

  //---------------------------------------------------------
  var option4 = new Option();
  option4.setLabel(dw.loadString("ice/repeatingRegion/cmd/option/wrapDWTRepeating"));
  option4.setShowIf(function() {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    return (currDOM.getIsTemplateDocument() && (ICEUtils.isNodeStandardRepeating(node) || ICEUtils.isNodeStandardRepeating(node.parentNode)));
  });
  option4.setEnabler(function() {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    return (nodesArr && nodesArr[0] && (nodesArr.length == 1));
  });
  option4.apply = function () {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    if (ICEUtils.isNodeStandardRepeating(node)) {
      ICECreateRepeatingRegion.applyOnStandardRepeatingRegion(currDOM, node, true);
    } else {
      ICECreateRepeatingRegion.applyOnStandardRepeatingRegion(currDOM, node.parentNode, true);
    }
  }
  opts.addOption(option4);

  return opts;
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayErrorForNodeProps
//
// DESCRIPTION:
//   This function returns the appropriate error message for the curren
//   set of node properties.
//
// ARGUMENTS:
//   nodeProps
//
// RETURNS:
//   (string) - the human readable error message
//--------------------------------------------------------------------
ICECreateRepeatingRegion.displayErrorForNodeProps = function(nodeProps) {
  var args = new Object();
  args.message = dw.loadString("ice/repeatingRegion/cmd/error/default");
  args.helpID = MM.ICE_HELP_CreateRepeatingRegion;

  if ((nodeProps & ICEUtils.NODE_SERVER_SIDE) != 0) {
    args.message = dw.loadString("ice/repeatingRegion/cmd/error/serverSide");
    args.helpID = MM.ICE_HELP_CreateRepeatingRegionError_ServerSide;
  } else if ((nodeProps & ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION) != 0) {
    args.message = dw.loadString("ice/repeatingRegion/cmd/error/outsideDWTEditable");
    args.helpID = MM.ICE_HELP_CreateRepeatingRegionError_OutsideDWTEditable;
  } else if ((nodeProps & ICEUtils.NODE_CONTAINS_ICE_REPREGGROUP) != 0) {
    args.message = dw.loadString("ice/repeatingRegion/cmd/error/containsICERepeatingGroup");
    args.helpID = MM.ICE_HELP_CreateRepeatingRegionError_ContainsICERepeatingGroup;
  } else if ((nodeProps & ICEUtils.NODE_ALREADY_ICE_REPREGGROUP) != 0) {
    // The same as ICEUtils.NODE_CONTAINS_ICE_REPREGGROUP because of the same effect for the end user
    args.message = dw.loadString("ice/repeatingRegion/cmd/error/containsICERepeatingGroup");
    args.helpID = MM.ICE_HELP_CreateRepeatingRegionError_ContainsICERepeatingGroup;
  } else if ((nodeProps & ICEUtils.NODE_CONTAINS_ICE_REPEATING) != 0) {
    args.message = dw.loadString("ice/repeatingRegion/cmd/error/containsICERepeating");
    args.helpID = MM.ICE_HELP_CreateRepeatingRegionError_ContainsICERepeating;
  } else if ((nodeProps & ICEUtils.NODE_ALREADY_ICE_REPEATING) != 0) {
    // The same as ICEUtils.NODE_CONTAINS_ICE_REPEATING because of the same effect for the end user
    args.message = dw.loadString("ice/repeatingRegion/cmd/error/containsICERepeating");
    args.helpID = MM.ICE_HELP_CreateRepeatingRegionError_ContainsICERepeating;
  } else if ((nodeProps & ICEUtils.NODE_INSIDE_ICE_EDITABLE) != 0) {
    args.message = dw.loadString("ice/repeatingRegion/cmd/error/insideICEEditable");
    args.helpID = MM.ICE_HELP_CreateRepeatingRegionError_InsideICEEditable;
  } else if ((nodeProps & ICEUtils.NODE_INSIDE_ICE_REPEATING) != 0) {
    args.message = dw.loadString("ice/repeatingRegion/cmd/error/insideICERepeating");
    args.helpID = MM.ICE_HELP_CreateRepeatingRegionError_InsideICERepeating;
  } else if ((nodeProps & ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD) != 0) {
    args.message = dw.loadString("ice/repeatingRegion/cmd/error/invalidParent");
    args.helpID = MM.ICE_HELP_CreateRepeatingRegionError_InvalidParent;
  }

  dwscripts.callCommand("ICEError.htm", args);
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyToNode
//
// DESCRIPTION:
//   This function applies the repeating region property on the given
//   node. It also adds the missing parent Repeating Region Group
//   node/property if missing, depending on the context.
//
// ARGUMENTS:
//   node (HTML Object) - we are supposed to apply Repeating on to.
//   skipOnBefore (boolean) - (optional) whether or not to skip the
//                            onBefore action
//   skipOnAfter (boolean) - (optional) whether or not to skip the
//                           onAfter action
//   doNotDisplayGroupAlert (boolean) - (optional) indicated to not
//                                 display the Group DIV inserted alert
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateRepeatingRegion.applyToNode = function(node, skipOnBefore, skipOnAfter, doNotDisplayGroupAlert) {
  if (!skipOnBefore) {
    ICECreateRepeatingRegion.onBeforeApply(dw.getDocumentDOM());
  }
  node.setAttribute(ICEUtils.repeatingRegionAttrName, ICEUtils.repeatingRegionAttrDefValue);
  if (!skipOnAfter) {
    ICECreateRepeatingRegion.onAfterApply(dw.getDocumentDOM(), doNotDisplayGroupAlert);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   insertNew
//
// DESCRIPTION:
//   This function inserts a brand new node with repeating region property
//   at the current insertion point. If there is a selection made it will
//   be replaced. It also adds the missing parent Repeating Region Group
//   node/property if missing, depending on the context.
//
// ARGUMENTS:
//   dom (DOM object) - current document DOM
//   doNotDisplayGroupAlert (boolean) - (optional) indicated to not
//                                 display the Group DIV inserted alert
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateRepeatingRegion.insertNew = function(dom, doNotDisplayGroupAlert) {
  ICECreateRepeatingRegion.onBeforeApply(dw.getDocumentDOM());
  dom.insertHTML(ICECreateRepeatingRegion.getRepeatingRegionInsertString(), true);
  ICECreateRepeatingRegion.onAfterApply(dw.getDocumentDOM(), doNotDisplayGroupAlert);
}


//--------------------------------------------------------------------
// FUNCTION:
//   wrapSelection
//
// DESCRIPTION:
//   This function wraps the current selection with a node that has the
//   repeating region property. It also adds the missing parent
//   Repeating Region Group node/property if missing, depending on the
//   context.
//
// ARGUMENTS:
//   dom (DOM Object) - the current document DOM
//   nodesArr (array of HTML onjects) - the current selection
//   doNotDisplayGroupAlert (boolean) - (optional) indicated to not
//                                 display the Group DIV inserted alert
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateRepeatingRegion.wrapSelection = function(dom, nodesArr, doNotDisplayGroupAlert) {
  ICECreateRepeatingRegion.onBeforeApply(dw.getDocumentDOM());
  dom.wrapTag(ICECreateRepeatingRegion.getRepeatingRegionOpenTag() + ICECreateRepeatingRegion.getRepeatingRegionCloseTag(), true, true);
  dom.runTranslator("ICE Region");
  ICECreateRepeatingRegion.onAfterApply(dw.getDocumentDOM(), doNotDisplayGroupAlert);
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyOnStandardRepeatingRegion
//
// DESCRIPTION:
//   This function applies the ICE Repeating Region on the given
//   standard DW template repeating region.
//
// ARGUMENTS:
//   dom (DOM Object) - the current document DOM
//   node (HTML object) - the node to apply to. It is supposed to be a
//                        standard DW repeating region
//   doNotDisplayGroupAlert (boolean) - (optional) indicated to not
//                                 display the Group DIV inserted alert
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateRepeatingRegion.applyOnStandardRepeatingRegion = function(dom, node, doNotDisplayGroupAlert) {
  ICECreateRepeatingRegion.onBeforeApply(dw.getDocumentDOM());

  // If the current selected node is a DWT Repeating Region and the only
  // child is a supported node then we will apply the Repeating Region on
  // that node without adding any extra DIVs in te page.
  if (node.childNodes && node.childNodes.length == 1 && node.childNodes[0].tagName && dwscripts.findInArray(ICEUtils.allowedRepeatingTags, node.childNodes[0].tagName.toUpperCase()) != -1) {
    ICECreateRepeatingRegion.applyToNode(node.childNodes[0], true, true, doNotDisplayGroupAlert);
  } else {
    node.innerHTML = ICECreateRepeatingRegion.getRepeatingRegionInsertString(node.innerHTML);
  }

  dom.setSelectedNode(node);
  ICECreateRepeatingRegion.onAfterApply(dw.getDocumentDOM(), doNotDisplayGroupAlert);
}


//--------------------------------------------------------------------
// FUNCTION:
//   addMissingRegionsGroup
//
// DESCRIPTION:
//   This function adds or upgrades the appropriate ICE Repeating Regions
//   Group node for the current selected Repeated Region node.
//
// ARGUMENTS:
//   doNotDisplayGroupAlert (boolean) - (optional) indicated to not
//                                 display the Group DIV inserted alert
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateRepeatingRegion.addMissingRegionsGroup = function(doNotDisplayGroupAlert) {
  var dom = dw.getDocumentDOM();
  var nodes = ICEUtils.getSelelectionAsArrayOfNodes(dom);
  var node;

  if (nodes && nodes.length) {
    // Normally we should go on this branch
    node = nodes[0];
  } else {
    // Just in case...read the old way
    node = dom.getSelectedNode(true, false, true);
  }

  // If the current selected node is a DWT Repeating Region then we will consider
  // the parent node insteda and then see if we can apply the group property on that
  // node or we will need to insert a DIV.
  if (ICEUtils.isNodeStandardRepeating(node.parentNode)) {
    node = node.parentNode;
  }

  var parentNode = node.parentNode;

  // If the parent node is not a Repeating Regions Group
  if (parentNode && parentNode.getAttribute && !parentNode.getAttribute(ICEUtils.repeatingRegionsGroupAttrName)) {

    // If the node just above (the previous sibling) is a Repeating Regions Group
    if (node.previousSibling && node.previousSibling.getAttribute && node.previousSibling.getAttribute(ICEUtils.repeatingRegionsGroupAttrName)) {
      // Ask the user whether the current repeating is part of it or not
      if (!ICEUtils.isNodeStandardRepeating(node) && (dwscripts.callCommand("ICERepeatingRegionAdjacent") == 1)) {
        // If the user confirms that the current repeating region is part of the group above, them we'll move the repeating region inside the group
        node.previousSibling.innerHTML += node.outerHTML;
        node.outerHTML = "";
      } else {
        // Otherwise we just insert a new Repeatin Regions Group node around the Repeating Region
        dom.wrapTag(ICECreateRepeatingRegion.getRepeatingRegionsGroupOpenTag() + ICECreateRepeatingRegion.getRepeatingRegionsGroupCloseTag(), true, true);
        dom.runTranslator("ICE Region");

        // Display the user a status that we have added a new DIV tag in the page
        if (ICEUtils.isNodeStandardRepeating(node) && !doNotDisplayGroupAlert) {
          alert(dw.loadString("ice/repeatingRegion/cmd/message/willAddGroupNode"));
        }
      }
    } else if (ICEUtils.canTransformParentNode(dom, node, ICEUtils.allowedRepeatingRegionsGroupTags, ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD | ICEUtils.NODE_CONTAINS_ICE_EDITABLE | ICEUtils.NODE_CONTAINS_ICE_REPEATING | ICEUtils.NODE_ALREADY_ICE_REPREGGROUP | ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION)) {
      parentNode.setAttribute(ICEUtils.repeatingRegionsGroupAttrName, ICEUtils.repeatingRegionsGroupAttrDefValue);
    } else {
      // Insert a new Repeatin Regions Group node around the Repeating Region
      dom.wrapTag(ICECreateRepeatingRegion.getRepeatingRegionsGroupOpenTag() + ICECreateRepeatingRegion.getRepeatingRegionsGroupCloseTag(), true, true);
      dom.runTranslator("ICE Region");

      // Display the user a status that we have added a new DIV tag in the page
      if (!doNotDisplayGroupAlert) {
        alert(dw.loadString("ice/repeatingRegion/cmd/message/willAddGroupNode"));
      }
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   onBeforeApply
//
// DESCRIPTION:
//   This function is called before the actual page update takes place
//
// ARGUMENTS:
//   theDOM (DOM Object) - the current page DOM
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateRepeatingRegion.onBeforeApply = function(theDOM) {
  ICEUtils.copyICERegionsAssets(theDOM);
}


//--------------------------------------------------------------------
// FUNCTION:
//   onAfterApply
//
// DESCRIPTION:
//   This function is called before the actual page update takes place
//
// ARGUMENTS:
//   theDOM (DOM Object) - the current page DOM
//   doNotDisplayGroupAlert (boolean) - (optional) indicated to not
//                                 display the Group DIV inserted alert
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateRepeatingRegion.onAfterApply = function(theDOM, doNotDisplayGroupAlert) {
  ICECreateRepeatingRegion.addMissingRegionsGroup(doNotDisplayGroupAlert);
  ICEUtils.addICENamespace(theDOM);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRepeatingRegionOpenTag
//
// DESCRIPTION:
//   This function returns the opening tag for a repeating region node.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - repeating region opening tag
//--------------------------------------------------------------------
ICECreateRepeatingRegion.getRepeatingRegionOpenTag = function() {
  return "<div " + ICEUtils.repeatingRegionAttrName + "=\"true\">";
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRepeatingRegionCloseTag
//
// DESCRIPTION:
//   This function returns the closing tag for a repeating region node.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - repeating region closing tag
//--------------------------------------------------------------------
ICECreateRepeatingRegion.getRepeatingRegionCloseTag = function() {
  return "</div>";
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRepeatingRegionsGroupOpenTag
//
// DESCRIPTION:
//   This function returns the opening tag for a Repeating Regions
//   Group node.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - repeating regions group opening tag
//--------------------------------------------------------------------
ICECreateRepeatingRegion.getRepeatingRegionsGroupOpenTag = function() {
  return "<div " + ICEUtils.repeatingRegionsGroupAttrName + "=\"*\">";
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRepeatingRegionsGroupCloseTag
//
// DESCRIPTION:
//   This function returns the closing tag for a Repeating Regions
//   Group node.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - repeating regions group opening tag
//--------------------------------------------------------------------
ICECreateRepeatingRegion.getRepeatingRegionsGroupCloseTag = function() {
  return "</div>";
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRepeatingRegionInsertString
//
// DESCRIPTION:
//   This function returns the string for a new Repeating Region node.
//
// ARGUMENTS:
//   regionContent - string - new region's content
//
// RETURNS:
//   (string) - Repeating Region node
//--------------------------------------------------------------------
ICECreateRepeatingRegion.getRepeatingRegionInsertString = function(regionContent) {
  var content = regionContent;
  if (!content) {
    content = dw.loadString("ice/repeatingRegion/nodeContent");
  }

  return ICECreateRepeatingRegion.getRepeatingRegionOpenTag() + content + ICECreateRepeatingRegion.getRepeatingRegionCloseTag();
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRepeatingRegionsGroupInsertString
//
// DESCRIPTION:
//   This function returns the string for a new Repeating Regions Group
//   node.
//
// ARGUMENTS:
//   regionContent (string) - (optional) new region's content
//
// RETURNS:
//   (string) - Repeating Regions Group node
//--------------------------------------------------------------------
ICECreateRepeatingRegion.getRepeatingRegionsGroupInsertString = function(regionContent) {
  var content = regionContent;
  if (!content) {
    content = "";
  }

  return ICECreateRepeatingRegion.getRepeatingRegionsGroupOpenTag() + content + ICECreateRepeatingRegion.getRepeatingRegionsGroupCloseTag();
}

