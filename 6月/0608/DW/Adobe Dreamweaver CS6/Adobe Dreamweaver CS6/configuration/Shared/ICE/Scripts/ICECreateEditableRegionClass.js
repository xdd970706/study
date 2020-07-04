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
//   ICECreateEditableRegion
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
//   applyOnStandardEditableRegion(dom, node)
//   onBeforeApply(dom)
//   onAfterApply(dom)
//--------------------------------------------------------------------
function ICECreateEditableRegion() {
  throw ("ICECreateRepeatingRegion is a static class.");
}


//--------------------------------------------------------------------
// FUNCTION:
//   apply
//
// DESCRIPTION:
//   This function applies a InContext Editable Region on the current
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
ICECreateEditableRegion.apply = function() {
  var currDOM = dw.getDocumentDOM();
  var currSel = ICEUtils.getSelelectionAsArrayOfNodes(currDOM);

  var nodeProps = 0;
  var theNode;
  var theProps;
  var allowGroupTransform = true;

  var DEFAULT_IGNORE_FLAGS = ICEUtils.NODE_ALREADY_ICE_REPEATING | ICEUtils.NODE_INSIDE_ICE_REPEATING | ICEUtils.NODE_INSIDE_ICE_REPREGGROUP;

  for (var i=0; i<currSel.length; i++) {
    theNode = currSel[i];
    theProps = ICEUtils.checkNode(currDOM, theNode, ICEUtils.allowedEditableTags, DEFAULT_IGNORE_FLAGS);

    // If the current node is a TD then we will re-evaluate the node status without some of the flags.
    if (theNode && theNode.tagName && theNode.tagName.toUpperCase && (theNode.tagName.toUpperCase() == "TD" || theNode.tagName.toUpperCase() == "TH")) {
      theProps =  ICEUtils.checkNode(currDOM, theNode, ICEUtils.allowedEditableTags, ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD | DEFAULT_IGNORE_FLAGS);
    }

    if (theNode.tagName && theNode.tagName.toUpperCase && (dwscripts.findInArray(ICEUtils.innerTagNames, theNode.tagName.toUpperCase()) == -1)) {
      allowGroupTransform = false;
    }

    // If we have selected more than one node and at the current one (at least one) is a DWT Editable
    // Region we'll consider the selection as being invalid
    if (currSel && (currSel.length > 1) && (theProps & ICEUtils.NODE_IS_DWT_EDITABLE_REGION) != 0) {
      theProps = theProps | ICEUtils.NODE_INVALID;
      theProps = theProps | ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION;
    }

    // If we have selected a node that is unsupported and which is already a repeating region, then
    // this case cannot be transformed into an Editable Region
    if ((theProps & ICEUtils.NODE_UNSUPPORTED) != 0) {
      if ((ICEUtils.checkNode(currDOM, theNode, ICEUtils.allowedEditableTags) & ICEUtils.NODE_ALREADY_ICE_REPEATING) != 0) {
        theProps = theProps | ICEUtils.NODE_ALREADY_ICE_REPEATING;
        theProps = theProps | ICEUtils.NODE_INVALID;
      }
    }

    // Also, if we have more than one node selected, and at least one is a ICE Repeating Region, then we can say
    // that the selection basically includes a ICE Repeating Region
    if (currSel.length > 1) {
      if ((ICEUtils.checkNode(currDOM, theNode, ICEUtils.allowedEditableTags) & ICEUtils.NODE_ALREADY_ICE_REPEATING) != 0) {
        theProps = theProps | ICEUtils.NODE_CONTAINS_ICE_REPEATING;
        theProps = theProps | ICEUtils.NODE_INVALID;
      }
    }

    nodeProps = nodeProps | theProps;
  }

  if ((currSel.length > 1) && !allowGroupTransform) {
    nodeProps = nodeProps | ICEUtils.NODE_UNSUPPORTED;
  }

  var selection = dw.getSelection();
  if (selection[0] == selection[1]) {
    var tempIgnore = ICEUtils.NODE_ALREADY_ICE_EDITABLE | DEFAULT_IGNORE_FLAGS;
    if (currSel[0] && currSel[0].tagName && currSel[0].tagName.toUpperCase && (currSel[0].tagName.toUpperCase() == "TD" || currSel[0].tagName.toUpperCase() == "TH")) {
      tempIgnore = tempIgnore | ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD;
    }
    nodeProps = ICEUtils.checkNode(currDOM, currSel[0], ICEUtils.allowedEditableTags, tempIgnore);
    if (nodeProps != 0) {
      nodeProps = nodeProps | ICEUtils.NODE_UNSUPPORTED;
    }
  }

  if ((nodeProps & ICEUtils.NODE_INVALID) != 0) {
    // Display the appropriate error
    ICECreateEditableRegion.displayErrorForNodeProps(nodeProps);
  } else if (currSel && currSel.length && ((nodeProps & ICEUtils.NODE_UNSUPPORTED) == 0)) {
    // The selection does not include INVALID nor UNSUPPORTED nodes => we should transform each of the selected nodes directly
    for (var i=0; i<currSel.length; i++) {
      if (currSel[i] != null) {
        if (currDOM && currDOM.getIsTemplateDocument() && ICEUtils.isNodeStandardEditable(currSel[i])) {
          ICECreateEditableRegion.applyOnStandardEditableRegion(currDOM, currSel[i]);
        } else {
          ICECreateEditableRegion.applyToNode(currSel[i]);
        }
      }
    }
  } else {
    var tempObj = new Object();
    tempObj.options = ICECreateEditableRegion.getUIOptions(currDOM, currSel);
    dwscripts.callCommand("ICEEditableRegion.htm", tempObj);
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
ICECreateEditableRegion.getUIOptions = function(currDOM, nodesArr) {
  var opts = new OptionsDispatcher("insert_options");
  opts.initialize();

  //---------------------------------------------------------
  var option1 = new Option();
  option1.setLabel(dw.loadString("ice/editableRegion/cmd/option/insertNew"));
  option1.setShowIf(function() {
    var selection = currDOM.getSelection();
    return (selection[0] == selection[1]);
  });
  option1.setEnabler(function() {
    var nodeProps = ICEUtils.checkNode(currDOM, nodesArr[0], []);
    return (!(nodeProps & ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD) && !(nodeProps & ICEUtils.NODE_IS_DWT_EDITABLE_REGION));
  });
  option1.apply = function () {
    ICECreateEditableRegion.insertNew(currDOM);
  }
  opts.addOption(option1);

  //---------------------------------------------------------
  var option2 = new Option();
  option2.setLabel(dw.loadString("ice/editableRegion/cmd/option/wrapSel"));
  option2.setShowIf(function() {
    var selection = currDOM.getSelection();
    return ((selection[0] < selection[1]) && (!currDOM.getIsTemplateDocument() || ICEUtils.isNodeStandardEditable(nodesArr[0]) || !ICEUtils.selectionIncludeTemplateMarkup(ICEUtils.nodesToStr(currDOM, nodesArr))));
  });
  option2.setEnabler(function() {
    var nodeProps = ICEUtils.checkNode(currDOM, nodesArr[0], []);
    return (((nodeProps & ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD) == 0) && ((nodeProps & ICEUtils.NODE_IS_DWT_EDITABLE_REGION) == 0));
  });
  option2.apply = function () {
    ICECreateEditableRegion.wrapSelection(currDOM, nodesArr);
  }
  opts.addOption(option2);

  //---------------------------------------------------------
  var option3 = new Option();
  option3.setLabel(dw.loadString("ice/editableRegion/cmd/option/transformParent"));
  option3.setShowIf(function() {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    return (!currDOM.getIsTemplateDocument() || (!ICEUtils.isNodeStandardEditable(node) && !ICEUtils.isNodeStandardEditable(node.parentNode)));
  });
  option3.setEnabler(function() {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    var ignoreFlags = ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD | ICEUtils.NODE_ALREADY_ICE_REPEATING | ICEUtils.NODE_INSIDE_ICE_REPEATING | ICEUtils.NODE_INSIDE_ICE_REPREGGROUP;
    return ICEUtils.canTransformParentNode(currDOM, node, ICEUtils.allowedEditableTags, ignoreFlags);
  });
  option3.apply = function () {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    ICECreateEditableRegion.applyToNode(node.parentNode);
  }
  opts.addOption(option3);

  //---------------------------------------------------------
  var option4 = new Option();
  option4.setLabel(dw.loadString("ice/editableRegion/cmd/option/wrapDWTEditable"));
  option4.setShowIf(function() {
    var node = nodesArr[0]; //kk
    if (node == null) {
      node = currDOM.getSelectedNode();
    }
    return (currDOM.getIsTemplateDocument() && (ICEUtils.isNodeStandardEditable(node) || ICEUtils.isNodeStandardEditable(node.parentNode)));
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
    if (ICEUtils.isNodeStandardEditable(node)) {
      ICECreateEditableRegion.applyOnStandardEditableRegion(currDOM, node);
    } else {
      ICECreateEditableRegion.applyOnStandardEditableRegion(currDOM, node.parentNode);
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
ICECreateEditableRegion.displayErrorForNodeProps = function(nodeProps) {
  var args = new Object();
  args.message = dw.loadString("ice/editableRegion/cmd/error/default");
  args.helpID = MM.ICE_HELP_CreateEditableRegion;

  if ((nodeProps & ICEUtils.NODE_SERVER_SIDE) != 0) {
    args.message = dw.loadString("ice/editableRegion/cmd/error/serverSide");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_ServerSide;
  } else if ((nodeProps & ICEUtils.NODE_OUTSIDE_DWT_EDITABLE_REGION) != 0) {
    args.message = dw.loadString("ice/editableRegion/cmd/error/outsideDWTEditable");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_OutsideDWTEditable;
  } else if ((nodeProps & ICEUtils.NODE_CONTAINS_ICE_REPREGGROUP) != 0) {
    args.message = dw.loadString("ice/editableRegion/cmd/error/containsICERepeatingGroup");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_ContainsICERepeatingGroup;
  } else if ((nodeProps & ICEUtils.NODE_ALREADY_ICE_REPREGGROUP) != 0) {
    // The same as ICEUtils.NODE_CONTAINS_ICE_REPREGGROUP because of the same effect for the end user
    args.message = dw.loadString("ice/editableRegion/cmd/error/containsICERepeatingGroup");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_ContainsICERepeatingGroup;
  } else if ((nodeProps & ICEUtils.NODE_CONTAINS_ICE_REPEATING) != 0) {
    args.message = dw.loadString("ice/editableRegion/cmd/error/containsICERepeating");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_ContainsICERepeating;
  } else if ((nodeProps & ICEUtils.NODE_CONTAINS_ICE_EDITABLE) != 0) {
    args.message = dw.loadString("ice/editableRegion/cmd/error/containsICEEditable");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_ContainsICEEditable;
  } else if ((nodeProps & ICEUtils.NODE_ALREADY_ICE_EDITABLE) != 0) {
    // The same as ICEUtils.NODE_CONTAINS_ICE_EDITABLE because of the same effect for the end user
    args.message = dw.loadString("ice/editableRegion/cmd/error/containsICEEditable");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_ContainsICEEditable;
  } else if ((nodeProps & ICEUtils.NODE_INSIDE_ICE_EDITABLE) != 0) {
    args.message = dw.loadString("ice/editableRegion/cmd/error/insideICEEditable");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_InsideICEEditable;
  } else if (((nodeProps & ICEUtils.NODE_ALREADY_ICE_REPEATING) != 0) && ((nodeProps & ICEUtils.NODE_UNSUPPORTED) != 0)) {
    args.message = dw.loadString("ice/editableRegion/cmd/error/cannotBeEditableAndRepeating");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_CannotBeEditableAndRepeating;
  } else if ((nodeProps & ICEUtils.NODE_PARENT_DO_NOT_ALLOW_DIV_CHILD) != 0) {
    args.message = dw.loadString("ice/editableRegion/cmd/error/invalidParent");
    args.helpID = MM.ICE_HELP_CreateEditableRegionError_InvalidParent;
  }

  dwscripts.callCommand("ICEError.htm", args);
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyToNode
//
// DESCRIPTION:
//   This function applies the editable region property on the given
//   node.
//
// ARGUMENTS:
//   node (HTML Object) - we are supposed to apply Editable on to.
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateEditableRegion.applyToNode = function(node) {
  ICECreateEditableRegion.onBeforeApply(dw.getDocumentDOM());
  node.setAttribute(ICEUtils.editableRegionAttrName, ICEUtils.editableRegionAttrDefValue);
  ICECreateEditableRegion.onAfterApply(dw.getDocumentDOM());
}


//--------------------------------------------------------------------
// FUNCTION:
//   insertNew
//
// DESCRIPTION:
//   This function inserts a brand new node with editable region property
//   at the current insertion point. If there is a selection made it will
//   be replaced.
//
// ARGUMENTS:
//   dom (DOM object) - current document DOM
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateEditableRegion.insertNew = function(dom) {
  ICECreateEditableRegion.onBeforeApply(dw.getDocumentDOM());
  dom.insertHTML(ICECreateEditableRegion.getEditableRegionInsertString(), true);
  ICECreateEditableRegion.onAfterApply(dw.getDocumentDOM());
}


//--------------------------------------------------------------------
// FUNCTION:
//   wrapSelection
//
// DESCRIPTION:
//   This function wraps the current selection with a node that has the
//   editable region property.
//
// ARGUMENTS:
//   dom (DOM Object) - the current document DOM
//   nodesArr (array of HTML onjects) - the current selection
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateEditableRegion.wrapSelection = function(dom, nodesArr) {
  ICECreateEditableRegion.onBeforeApply(dw.getDocumentDOM());
  dom.wrapTag(ICECreateEditableRegion.getEditableRegionOpenTag() + ICECreateEditableRegion.getEditableRegionCloseTag(), true, true);
  dom.runTranslator("ICE Region");
  ICECreateEditableRegion.onAfterApply(dw.getDocumentDOM());
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyOnStandardEditableRegion
//
// DESCRIPTION:
//   This function applies the ICE Editable Region on the given
//   standard DW template editable region.
//
// ARGUMENTS:
//   dom (DOM Object) - the current document DOM
//   node (HTML object) - the node to apply to. It is supposed to be a
//                        standard DW editable region
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateEditableRegion.applyOnStandardEditableRegion = function(dom, node) {
  ICECreateEditableRegion.onBeforeApply(dw.getDocumentDOM());
  node.outerHTML = ICECreateEditableRegion.getEditableRegionInsertString(node.outerHTML);
  //dom.setSelectedNode(node);
  ICECreateEditableRegion.onAfterApply(dw.getDocumentDOM());
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
ICECreateEditableRegion.onBeforeApply = function(theDOM) {
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
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ICECreateEditableRegion.onAfterApply = function(theDOM) {
  ICEUtils.addICENamespace(theDOM);
}


//--------------------------------------------------------------------
// FUNCTION:
//   getEditableRegionOpenTag
//
// DESCRIPTION:
//   This function returns the opening tag for an editable region.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - editable region opening tag
//--------------------------------------------------------------------
ICECreateEditableRegion.getEditableRegionOpenTag = function() {
  return "<div " + ICEUtils.editableRegionAttrName + "=\"*\">";
}


//--------------------------------------------------------------------
// FUNCTION:
//   getEditableRegionCloseTag
//
// DESCRIPTION:
//   This function returns the closing tag for an editable region.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - editable region closing tag
//--------------------------------------------------------------------
ICECreateEditableRegion.getEditableRegionCloseTag = function() {
  return "</div>";
}


//--------------------------------------------------------------------
// FUNCTION:
//   getEditableRegionInsertString
//
// DESCRIPTION:
//   This function returns the string for a new editable region.
//
// ARGUMENTS:
//   regionContent (string) - (optional) new region's content
//
// RETURNS:
//   string - editable region node
//--------------------------------------------------------------------
ICECreateEditableRegion.getEditableRegionInsertString = function(regionContent) {
  var content = regionContent;
  if (!content) {
    content = dw.loadString("ice/editableRegion/nodeContent");
  }

  return ICECreateEditableRegion.getEditableRegionOpenTag() + content + ICECreateEditableRegion.getEditableRegionCloseTag();
}
