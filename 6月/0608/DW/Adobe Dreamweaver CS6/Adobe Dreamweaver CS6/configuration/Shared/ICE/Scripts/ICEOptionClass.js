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
//   Option
//
// DESCRIPTION:
//   This function defines an option in the UI. Such an option will have
//   a label associated, a condition to display it or not and an
//   enabled/disabled condition
//
// PUBLIC FUNCTIONS:
//   setLabel(label)
//   getLabel()
//   setHTMLControl(htmlControl)
//   getHTMLControl()
//   setShowIf(showIfFunction)
//   shouldDisplayOption()
//   setEnabler(enablerFunction)
//   isEnabled()
//--------------------------------------------------------------------
function Option(label) {
  this.label = (typeof(label) == "string") ? label : "";
  this.htmlControl = null;
  this.showIfFunction = function() {
    return false;
  };
  this.enablerFunction = function() {
    return true;
  };
  this.visible = false;
  this.enabled = false;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setLabel
//
// DESCRIPTION:
//   This function set sthe lable for the current option
//
// ARGUMENTS:
//   label (string) - the label
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Option.prototype.setLabel = function(label) {
  this.label = label;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getLabel
//
// DESCRIPTION:
//   This function retunrs the label for the current option
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - the label
//--------------------------------------------------------------------
Option.prototype.getLabel = function() {
  return this.label;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setHTMLControl
//
// DESCRIPTION:
//   This function sets the HTML control (radio button) for the current
//   option
//
// ARGUMENTS:
//   htmlControl (HTML object) - the radio button as HTML object
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Option.prototype.setHTMLControl = function(htmlControl) {
  this.htmlControl = htmlControl;
}


//--------------------------------------------------------------------
// FUNCTION:
//   getHTMLControl
//
// DESCRIPTION:
//   This function returns the HTML control for the current option
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (HTML object) - the radio button as HTML object
//--------------------------------------------------------------------
Option.prototype.getHTMLControl = function() {
  return this.htmlControl;
}


//--------------------------------------------------------------------
// FUNCTION:
//   setShowIf
//
// DESCRIPTION:
//   This function sets the callback function that decides whether or
//   not to display the option.
//
// ARGUMENTS:
//   showIfFunction (function) - the function that decides to display
//                               or not the option
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Option.prototype.setShowIf = function(showIfFunction) {
  this.showIfFunction = showIfFunction;
  this.visible = this.showIfFunction();
}


//--------------------------------------------------------------------
// FUNCTION:
//   shouldDisplayOptionunctionName
//
// DESCRIPTION:
//   This function calls the "showIfFunction" function and returns the
//   result
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (boolean) - true if the option needs to be displayed, false otherwise
//--------------------------------------------------------------------
Option.prototype.shouldDisplayOption = function() {
  return this.visible; //this.showIfFunction();
}


//--------------------------------------------------------------------
// FUNCTION:
//   setEnabler
//
// DESCRIPTION:
//   This function sets the callback function that decides whether or
//   not the option is enabled.
//
// ARGUMENTS:
//   enablerFunction (function) - the function that decides to enable
//                                or not the option
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Option.prototype.setEnabler = function(enablerFunction) {
  this.enablerFunction = enablerFunction;
  this.enabled = this.enablerFunction();
}


//--------------------------------------------------------------------
// FUNCTION:
//   isEnabled
//
// DESCRIPTION:
//   This function calls the "enablerFunction" function and returns the
//   result
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (boolean) - true if the option is enabled, false otherwise
//--------------------------------------------------------------------
Option.prototype.isEnabled = function() {
  return this.enabled; //this.enablerFunction();
}

