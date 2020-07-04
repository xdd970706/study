/*
 * ADOBE SYSTEMS INCORPORATED
 * Copyright 2007 Adobe Systems Incorporated
 * All Rights Reserved
 * 
 * NOTICE:  Adobe permits you to use, modify, and distribute this file in accordance with the 
 * terms of the Adobe license agreement accompanying it. If you have received this file from a 
 * source other than Adobe, then your use, modification, or distribution of it requires the prior 
 * written permission of Adobe.
 */

// WizardControl Class

// EVENT MODEL
//  TO DO: Put dscription here


// INTERFACE
//
// WizardControl methods:
//


//--------------------------------------------------------------------
// FUNCTION:
//   WizardControl
//
// DESCRIPTION:
//   Constructor function
//
// ARGUMENTS:
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function WizardControl(noSteps) {
  this.currentStepNo = null;
  this.clickedStepNo = null;
  this.noOfSteps = noSteps ? noSteps : 0;
  this.panelTitle = "wizardTitleStep";
  this.panelContent = "wizardContentStep";
  this.panelTitleElNames = new Array();  
  this.panelContentElNames = new Array();
  this.okButtonID = "wizOkButton";
  this.cancelButtonID = "wizCancelButton";
  this.nextButtonID = "wizNextButton"
  this.prevButtonID = "wizPrevButton"
  
  // callback functions
  this.onBeforePrevClicked;
  this.onAfterPrevClicked;
  this.onBeforeNextClicked;
  this.onAfterNextClicked;
  this.onBeforeChangeStep;
  this.onAfterChangeStep;
}

// methods
WizardControl.prototype.initializeUI    = WizardControl_initializeUI;
WizardControl.prototype.showStep        = WizardControl_showStep;
WizardControl.prototype.showPrevStep    = WizardControl_showPrevStep;
WizardControl.prototype.showNextStep    = WizardControl_showNextStep;
WizardControl.prototype.getCurrentStep  = WizardControl_getCurrentStep;
WizardControl.prototype.getClickedStep  = WizardControl_getClickedStep;
WizardControl.prototype.hideCurrentStep = WizardControl_hideCurrentStep;
WizardControl.prototype.disableButton   = WizardControl_disableButton;

//****************************************************************************************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function WizardControl_initializeUI(initialStep)
{
  var showStepNo = initialStep ? initialStep : 0;
   
  // find all elements in page and package them in array
  if (this.noOfSteps)
  {
    var arrElements = document.getElementsByAttributeName("id");
    if (arrElements && arrElements.length)
    {
      for (var i = 0; i < arrElements.length; i++)
      {
        var idAttrValue = arrElements[i].getAttribute("id");
        if (idAttrValue)
        {
          var stepNo = idAttrValue.match(/\d/i);
          if (stepNo != null)
          {
            if(!idAttrValue.indexOf(this.panelTitle))
            {
              this.panelTitleElNames[stepNo] = idAttrValue;
            }
            if(!idAttrValue.indexOf(this.panelContent))
            {
              this.panelContentElNames[stepNo] = idAttrValue;
            }
          }
        }
      }
      // check if all neccessary elements are found
      if (this.noOfSteps != this.panelTitleElNames.length)
      {
        throw "Some of wizard titles are missing.";
      }
      else if (this.noOfSteps != this.panelContentElNames.length)
      {
        throw "Some of wizard content containers are missing.";
      }
    }

    // show first step or the arbitrary step
    this.showStep(showStepNo);
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   showStep
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function WizardControl_showStep(stepNo)
{
  var nextDisabled = false;
  var prevDisabled = false;
  
  this.clickedStepNo = stepNo;
   
  if (stepNo >= 0 && stepNo < this.noOfSteps && stepNo != this.currentStepNo)
  {
    // call callback functions
    if (typeof (this.onBeforeChangeStep) == "function")
    {
      if (this.onBeforeChangeStep() == false)
      {
        return;
      }
    }
    if (this.currentStepNo != null)
    {
      this.hideCurrentStep();
    }

    // show the elements
    if (this.panelTitleElNames[stepNo])
    {
      var domEl = document.getElementById(this.panelTitleElNames[stepNo]);
      
      if (domEl)
      {
        domEl.style.display = "block";
      }
    }
    if (this.panelContentElNames[stepNo])
    {
      var domEl = document.getElementById(this.panelContentElNames[stepNo]);
      
      if (domEl)
      {
        domEl.style.display = "block";
      }
    }
    
    this.currentStepNo = stepNo;

    // call callback functions
    if (typeof (this.onAfterChangeStep) == "function")
    {
      this.onAfterChangeStep();
    }
     
  }
  
  // enable disable buttons
  // disable next or prev button
  if (stepNo == (this.noOfSteps - 1) )
  {
    nextDisabled = true;
  }
  if (!stepNo)
  {
    prevDisabled = true;
  }
  this.disableButton("previous", prevDisabled);
  this.disableButton("next", nextDisabled);
    
}

//--------------------------------------------------------------------
// FUNCTION:
//   showPrevStep
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function WizardControl_showPrevStep()
{
  if (this.currentStepNo >= 1)
  {
    // call callback functions
    if (typeof (this.onBeforePrevClicked) == "function")
    {
      this.onBeforePrevClicked();
    }

    this.showStep(this.currentStepNo - 1);

    // call callback functions
    if (typeof (this.onAfterPrevClicked) == "function")
    {
      this.onAfterPrevClicked();
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   showNextStep
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function WizardControl_showNextStep()
{
  if (this.currentStepNo < (this.noOfSteps - 1))
  {
    // call callback functions
    if (typeof (this.onBeforeNextClicked) == "function")
    {
      this.onBeforeNextClicked();
    }
    
    this.showStep(this.currentStepNo + 1);

    // call callback functions
    if (typeof (this.onAfterNextClicked) == "function")
    {
      this.onBeforeNextClicked();
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   getCurrentStep
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function WizardControl_getCurrentStep()
{
  return this.currentStepNo;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getClickedStep
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function WizardControl_getClickedStep()
{
  return this.clickedStepNo;
}

//--------------------------------------------------------------------
// FUNCTION:
//   hideCurrentStep
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function WizardControl_hideCurrentStep()
{
  if (this.currentStepNo != null && this.currentStepNo >= 0 && this.currentStepNo < this.noOfSteps)
  {
    // hide the elements
    if (this.panelTitleElNames[this.currentStepNo])
    {
      var domEl = document.getElementById(this.panelTitleElNames[this.currentStepNo]);
      
      if (domEl)
      {
        domEl.style.display = "none";
      }
    }
    if (this.panelContentElNames[this.currentStepNo])
    {
      var domEl = document.getElementById(this.panelContentElNames[this.currentStepNo]);
      
      if (domEl)
      {
        domEl.style.display = "none";
      }
    }
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   enableButton
//
// DESCRIPTION:
//
// ARGUMENTS:
//
// RETURNS:
//--------------------------------------------------------------------
function WizardControl_disableButton(buttonName, disable)
{
  var btnID;
  var focusBtnId = null;
  switch(buttonName)
  {
    case "previous":
        btnID = this.prevButtonID;
        focusBtnId = this.nextButtonID;
        break;
    case "next":
        btnID = this.nextButtonID;
        focusBtnId = this.okButtonID;
        break;
    case "ok":
        btnID = this.okButtonID;
        break;
    case "cancel":
        btnID = this.cancelButtonID;
        break;
  }
  
  var btnEl = document.getElementById(btnID);
  if (btnEl)
  {
    if (disable)
    {
      btnEl.disabled = true;
      if (focusBtnId != null)
      {
        // set the focus to specified button
        var focusBtnEl = document.getElementById(focusBtnId);
        if (focusBtnEl)
        {
          focusBtnEl.focus();
        }
      }
    }
    else
    {
      btnEl.disabled = false;
    }
  }
}
