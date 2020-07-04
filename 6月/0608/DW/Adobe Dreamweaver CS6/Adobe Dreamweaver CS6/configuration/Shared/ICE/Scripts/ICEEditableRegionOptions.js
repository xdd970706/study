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
//   ICEEditableRegionOptions
//
// DESCRIPTION:
//   This class defines some static function that will allows us an easy
//   management of all options for a ICE Editable Region.
//
// FUNCTIONS:
//   ICEEditableRegionOptions.getAllGroups()
//   ICEEditableRegionOptions.getTitleForGroup(groupID)
//   ICEEditableRegionOptions.getShortTitleForGroup(groupID)
//   ICEEditableRegionOptions.getDescriptionForGroup(groupID)
//   ICEEditableRegionOptions.getButtonNamesForGroup(groupID)
//   ICEEditableRegionOptions.getAllButtonNames()
//   ICEEditableRegionOptions.getTableForGroup(groupID, defaultState)
//   ICEEditableRegionOptions.toggleCheckbox(buttonName)
//   ICEEditableRegionOptions.getCheckboxNodesFromDOM(dom)
//
// CONSTANTS:
//   ICEEditableRegionOptions.groups
//--------------------------------------------------------------------
function ICEEditableRegionOptions() {
  throw ("This is a static class.");
}

ICEEditableRegionOptions.getAllGroups             = ICEEditableRegionOptions_getAllGroups;
ICEEditableRegionOptions.getTitleForGroup         = ICEEditableRegionOptions_getTitleForGroup;
ICEEditableRegionOptions.getShortTitleForGroup    = ICEEditableRegionOptions_getShortTitleForGroup;
ICEEditableRegionOptions.getDescriptionForGroup   = ICEEditableRegionOptions_getDescriptionForGroup;
ICEEditableRegionOptions.getButtonNamesForGroup   = ICEEditableRegionOptions_getButtonNamesForGroup;
ICEEditableRegionOptions.getAllButtonNames        = ICEEditableRegionOptions_getAllButtonNames;
ICEEditableRegionOptions.getTableForGroup         = ICEEditableRegionOptions_getTableForGroup;
ICEEditableRegionOptions.toggleCheckbox           = ICEEditableRegionOptions_toggleCheckbox;
ICEEditableRegionOptions.getCheckboxNodesFromDOM  = ICEEditableRegionOptions_getCheckboxNodesFromDOM;


// Defines all the options and their respective properties
ICEEditableRegionOptions.groups = {
  basic: {
    title: dw.loadString("ice/editableRegion/groups/basic/label"),
    shortTitle: dw.loadString("ice/editableRegion/groups/basic/shortLabel"),
    description: dw.loadString("ice/editableRegion/groups/basic/description"),
    buttons: [
      {
        name: "boldButton",
        value: "bold",
        alt: dw.loadString("ice/editableRegion/label/bold"),
        image: "Shared/ICE/Images/bold.png"
      },
      {
        name: "italicButton",
        value: "italic",
        alt: dw.loadString("ice/editableRegion/label/italic"),
        image: "Shared/ICE/Images/italic.png"
      },
      {
        name: "underlineButton",
        value: "underline",
        alt: dw.loadString("ice/editableRegion/label/underline"),
        image: "Shared/ICE/Images/underline.png"
      },
      {
        name: "alignmentButton",
        value: "align_justify,align_right,align_center,align_left",
        alt: dw.loadString("ice/editableRegion/label/alignment"),
        image: "Shared/ICE/Images/alignment.png"
      },
      {
        name: "fontButton",
        value: "font_face",
        alt: dw.loadString("ice/editableRegion/label/font"),
        image: "Shared/ICE/Images/font.png"
      },
      {
        name: "fontSizeButton",
        value: "font_size",
        alt: dw.loadString("ice/editableRegion/label/fontSize"),
        image: "Shared/ICE/Images/font_size.png"
      }
    ]
  },
  advanced: {
    title: dw.loadString("ice/editableRegion/groups/advanced/label"),
    shortTitle: dw.loadString("ice/editableRegion/groups/advanced/shortLabel"),
    description: dw.loadString("ice/editableRegion/groups/advanced/description"),
    buttons: [
      {
        name: "indentButton",
        value: "indent,outdent",
        alt: dw.loadString("ice/editableRegion/label/indent"),
        image: "Shared/ICE/Images/indent.png"
      },
      {
        name: "listsButton",
        value: "ordered_list,unordered_list",
        alt: dw.loadString("ice/editableRegion/label/numberedList"),
        image: "Shared/ICE/Images/numberlist.png"
      },
      {
        name: "headingsButton",
        value: "paragraph_styles",
        alt: dw.loadString("ice/editableRegion/label/headings"),
        image: "Shared/ICE/Images/headings.png"
      },
      {
        name: "highlightColorButton",
        value: "background_color",
        alt: dw.loadString("ice/editableRegion/label/highlightColor"),
        image: "Shared/ICE/Images/highlight_color.png"
      },
      {
        name: "fontColorButton",
        value: "font_color",
        alt: dw.loadString("ice/editableRegion/label/fontColor"),
        image: "Shared/ICE/Images/font_color.png"
      },
      {
        name: "stylesButton",
        value: "css_styles",
        alt: dw.loadString("ice/editableRegion/label/styles"),
        image: "Shared/MM/Images/hintCss.gif"
      }
    ]
  },
  insert: {
    title: dw.loadString("ice/editableRegion/groups/insert/label"),
    shortTitle: dw.loadString("ice/editableRegion/groups/insert/shortLabel"),
    description: dw.loadString("ice/editableRegion/groups/insert/description"),
    buttons: [
//      {
//        name: "insertTableButton",
//        value: "table",
//        alt: dw.loadString("ice/editableRegion/label/insertTable"),
//        image: "Objects/Common/Table.png"
//      },
      {
        name: "insertImageButton",
        value: "media",
        alt: dw.loadString("ice/editableRegion/label/insertImage"),
        image: "Shared/ICE/Images/insert_image.png"
      },
      {
        name: "insertLinkButton",
        value: "hyperlink",
        alt: dw.loadString("ice/editableRegion/label/insertLink"),
        image: "Shared/ICE/Images/link.png"
      }
    ]
  }
}



//--------------------------------------------------------------------
// FUNCTION:
//   getAllGroups
//
// DESCRIPTION:
//   This function returns all the available groups of options
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (array of strings) - the available groups
//--------------------------------------------------------------------
function ICEEditableRegionOptions_getAllGroups() {
  var retArray = new Array();

  for (var i in ICEEditableRegionOptions.groups) {
    retArray.push(i);
  }

  return retArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getTitleForGroup
//
// DESCRIPTION:
//   This function retunrs the title for the given group
//
// ARGUMENTS:
//   groupID (string) - the group name
//
// RETURNS:
//   (string) - the group title
//--------------------------------------------------------------------
function ICEEditableRegionOptions_getTitleForGroup(groupID) {
  var retStr = "";

  if (ICEEditableRegionOptions.groups && ICEEditableRegionOptions.groups[groupID]) {
    retStr = ICEEditableRegionOptions.groups[groupID].title;
  }

  return retStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getShortTitleForGroup
//
// DESCRIPTION:
//   This function returns the short title for the given group
//
// ARGUMENTS:
//   groupID (string) - the group name
//
// RETURNS:
//   (string) - the group short title
//--------------------------------------------------------------------
function ICEEditableRegionOptions_getShortTitleForGroup(groupID) {
  var retStr = "";

  if (ICEEditableRegionOptions.groups && ICEEditableRegionOptions.groups[groupID]) {
    retStr = ICEEditableRegionOptions.groups[groupID].shortTitle;
  }

  return retStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getDescriptionForGroup
//
// DESCRIPTION:
//   This function retunrs the description for the given group
//
// ARGUMENTS:
//   groupID (string) - the group name
//
// RETURNS:
//   (string) - the group description
//--------------------------------------------------------------------
function ICEEditableRegionOptions_getDescriptionForGroup(groupID) {
  var retStr = "";

  if (ICEEditableRegionOptions.groups && ICEEditableRegionOptions.groups[groupID]) {
    retStr = ICEEditableRegionOptions.groups[groupID].description;
  }

  return retStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getButtonNamesForGroup
//
// DESCRIPTION:
//   This function returns all the buutons' names for the given group
//
// ARGUMENTS:
//   groupID (string) - the group name
//
// RETURNS:
//   (array of String) - all the buttons' names for the group
//--------------------------------------------------------------------
function ICEEditableRegionOptions_getButtonNamesForGroup(groupID) {
  var namesArr = new Array();

  if (ICEEditableRegionOptions.groups && ICEEditableRegionOptions.groups[groupID]) {
    var tempObj = ICEEditableRegionOptions.groups[groupID];
    for (var i=0; i<tempObj.buttons.length; i++) {
      namesArr.push(tempObj.buttons[i].name);
    }
  }

  return namesArr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getAllButtonNames
//
// DESCRIPTION:
//   This function returns all the buutons' names for all the available
//   groups
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (array of String) - all the buttons' names for all the groups
//--------------------------------------------------------------------
function ICEEditableRegionOptions_getAllButtonNames() {
  var namesArr = new Array();
  var tempObj;

  for (var i in ICEEditableRegionOptions.groups) {
    tempObj = ICEEditableRegionOptions.groups[i];
    for (var i=0; i<tempObj.buttons.length; i++) {
      namesArr.push(tempObj.buttons[i].name);
    }
  }

  return namesArr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getTableForGroup
//
// DESCRIPTION:
//   This function buils a table containing all the options for the
//   given group. Each option will have the image above and the checkbox
//   below.
//
// ARGUMENTS:
//   groupID (string) - the group name
//   defaultState (boolean) - the defaiult checked state for all the
//                            options
//
// RETURNS:
//   (string) - the table as string containing all the options
//--------------------------------------------------------------------
function ICEEditableRegionOptions_getTableForGroup(groupID, defaultState) {
  var retStr = "";
  var tempObj = ICEEditableRegionOptions.groups[groupID];

  var tr1 = "\t<tr>\n";
  var tr2 = "\t<tr>\n";

  for (var i=0; i<tempObj.buttons.length; i++) {
    tr1 += "\t\t<td class=\"optionItem\" nowrap><label for=\"" + tempObj.buttons[i].name + "\"><input type=\"image\" src=\"../" + tempObj.buttons[i].image + "\" alt=\"" + tempObj.buttons[i].alt + "\" onClick=\"ICEEditableRegionOptions.toggleCheckbox('" + tempObj.buttons[i].name + "')\" /></label></td>\n";

    tr2 += "\t\t<td class=\"optionItem\" nowrap><input type=\"checkbox\" id=\"" + tempObj.buttons[i].name + "\" name=\"" + tempObj.buttons[i].name + "\" onClick=\"buttonChecked()\" " + (defaultState ? " checked" : "") + "/></td>\n";
  }

  tr1 += "\t</tr>\n";
  tr2 += "\t</tr>\n";

  retStr = "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n" + tr1 + tr2 + "</table>";

  return retStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getCheckboxNodesFromDOM
//
// DESCRIPTION:
//   This function returns the hash with the actual DOM object for the
//   nodes.
//
// ARGUMENTS:
//   dom
//
// RETURNS:
//   (hash of option:HTML nodes) - all the options and the appropriate
//                                 checkbox HTML control
//--------------------------------------------------------------------
function ICEEditableRegionOptions_getCheckboxNodesFromDOM(dom) {
  var tempObj;
  var nodesHash = new Object();

  for (var i in ICEEditableRegionOptions.groups) {
    tempObj = ICEEditableRegionOptions.groups[i];
    for (var j=0; j<tempObj.buttons.length; j++) {
      nodesHash[tempObj.buttons[j].name] = dom.getElementById(tempObj.buttons[j].name);
    }
  }

  return nodesHash;
}


//--------------------------------------------------------------------
// FUNCTION:
//   toggleCheckbox
//
// DESCRIPTION:
//   This function changes programmatically the state of a checkbox. If
//   it is initially checked, it will be unchecked and vice-versa.
//
// ARGUMENTS:
//   buttonName (string) - the checkbox that needs to be checked/unchecked
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ICEEditableRegionOptions_toggleCheckbox(buttonName) {
  var buttonObj;
  if (buttonName) {
    buttonObj = document.getElementById(buttonName);
  }

  if (buttonObj) {
    var checked = buttonObj.getAttribute("checked");

    if (checked) {
      buttonObj.removeAttribute("checked");
    } else {
      buttonObj.setAttribute("checked", "true");
    }

    eval(buttonObj.onClick);
  }
}

