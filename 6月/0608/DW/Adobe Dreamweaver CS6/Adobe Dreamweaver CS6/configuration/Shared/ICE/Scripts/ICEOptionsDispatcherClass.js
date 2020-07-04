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
//   OptionsDispatcher
//
// DESCRIPTION:
//   This class is the dispatcher for all the UI options
//
// PUBLIC FUNCTIONS:
//   initialize()
//   addOption(option)
//   setCheckedFirstOption()
//   getCheckedOption()
//   getOptionsAsHTMLTable()
//   readHTMLControls()
//   updateUIOptionsContainer()
//--------------------------------------------------------------------
function OptionsDispatcher(name) {
  this.name = name;
  this.options = new Array();
  this.disabledClass = "disabled";
}


//--------------------------------------------------------------------
// FUNCTION:
//   initialize
//
// DESCRIPTION:
//   This function initializes the object
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
OptionsDispatcher.prototype.initialize = function() {
  this.options = new Array();
}


//--------------------------------------------------------------------
// FUNCTION:
//   addOption
//
// DESCRIPTION:
//   This function adds a new option to the list of managed options
//
// ARGUMENTS:
//   option (ICEOption object) - the option
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
OptionsDispatcher.prototype.addOption = function(option) {
  this.options.push(option);
}


//--------------------------------------------------------------------
// FUNCTION:
//   setCheckedFirstOption
//
// DESCRIPTION:
//   This function selects the first option that is displayed and enabled
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
OptionsDispatcher.prototype.setCheckedFirstOption = function() {
  for (var i=0; i<this.options.length; i++) {
    if (this.options[i].shouldDisplayOption() && this.options[i].isEnabled()) {
      this.options[i].getHTMLControl().setAttribute("checked", "checked");
      break;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getCheckedOption
//
// DESCRIPTION:
//   This function retunrs the current selected option
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (ICEOption object) - the option selected
//--------------------------------------------------------------------
OptionsDispatcher.prototype.getCheckedOption = function() {
  var optionObj = null;
  for (var i=0; i<this.options.length; i++) {
    if (this.options[i].shouldDisplayOption() && this.options[i].isEnabled()) {
      if (this.options[i].getHTMLControl().getAttribute("checked")) {
        optionObj = this.options[i];
        break;
      }
    }
  }
  return optionObj;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getOptionsAsHTMLTable
//
// DESCRIPTION:
//   This function retuns a TABLE with all the displayable options
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - the TABLE's outer HTML
//--------------------------------------------------------------------
OptionsDispatcher.prototype.getOptionsAsHTMLTable = function() {
  var retStr = "";

  for (var i=0; i<this.options.length; i++) {
    if (this.options[i].shouldDisplayOption()) {
      isEnabled = this.options[i].isEnabled();
      retStr += "\t<tr>\n";
      retStr += "\t\t<td>\n\t\t\t<input type=\"radio\" name=\" " + this.name + "\" id=\"option" + i + "\" " + (!isEnabled ? "disabled" : "") + "/>\n\t\t</td>\n";
      retStr += "\t\t<td nowrap>\n\t\t\t<label for=\"option" + i + "\" " + (!isEnabled ? "class=\"" + this.disabledClass + "\"" : "") + ">" + this.options[i].getLabel() + "</label>\n\t\t</td>\n";
      retStr += "\t</tr>\n";
    }
  }

  retStr = "<table cellpadding=\"2\" cellspacing=\"0\" border=\"0\">\n" + retStr + "</table>";

  return retStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   readHTMLControls
//
// DESCRIPTION:
//   This function reads all the options form the current UI and updates
//   the htmlControl property for each of them.
//
// ARGUMENTS:
//   dom (DOM Object) - the DOM node where the options can be found
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
OptionsDispatcher.prototype.readHTMLControls = function(dom) {
  for (var i=0; i<this.options.length; i++) {
    this.options[i].setHTMLControl(dom.getElementById("option" + i));
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUIOptionsContainer
//
// DESCRIPTION:
//   This function inserts the displayable options into the given container
//
// ARGUMENTS:
//   dom (DOM object) - the DOM where the options' container and
//                      container can be found
//   wnd (WINDOW object) - the current window object
//   container (HTML control) - the nod ein page that acts as a container
//                              for all the options
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
OptionsDispatcher.prototype.updateUIOptionsContainer = function(dom, wnd, container) {
  container.innerHTML = this.getOptionsAsHTMLTable();
  wnd.resizeToContents();
  this.readHTMLControls(dom);
  this.setCheckedFirstOption();
}

