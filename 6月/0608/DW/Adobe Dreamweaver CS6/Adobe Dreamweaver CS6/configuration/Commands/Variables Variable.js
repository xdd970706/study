// Copyright 2001-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc         = MM.HELP_ssCFVariablesVariable;

//******************* API **********************

function commandButtons(){
  return new Array(MM.BTN_OK,"okClicked()",MM.BTN_Cancel,"window.close()",MM.BTN_Help,"displayHelp()");
}

//***************** LOCAL FUNCTIONS  ******************

function okClicked(){
  var nameObj = document.forms[0].theName;

  if (nameObj.value) {
    if (IsValidVarName(nameObj.value)) {
      MM.VariablesContents = nameObj.value;
      MM.retVal = "OK";
      window.close();
    } else {
      alert(nameObj.value + " " + MM.MSG_InvalidParamName);
    }
  } else {
    alert(MM.MSG_NoName);
  }
}
