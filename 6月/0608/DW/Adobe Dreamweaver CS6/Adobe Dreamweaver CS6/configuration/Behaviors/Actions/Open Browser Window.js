// Copyright 1998, 1999, 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.

//*************** GLOBALS VARS *****************

var helpDoc = MM.HELP_behOpenBrowserWindow;

//******************* BEHAVIOR FUNCTION **********************

//Opens a new browser windows, with a number of options.
//Accepts the following arguments:
//  theURL   - URL, often a filename, URL encoded. (ex: file.htm, http://www.x.com/y.htm)
//  winName  - optional name for the window, used to access the window via javascript
//  features - series of window options, none are required. Setting all of them gives:
//                toolbar=yes,location=yes,status=yes,menubar=yes,scrollbars=yes,
//                resizable=yes,width=300,height=200
//
//Calls the window.open() method and passes it the desired features.

function MM_openBrWindow(theURL,winName,features) { //v2.0
  window.open(theURL,winName,features);
}


//******************* API **********************


//Checks to see to which tags or events this behavior applies.
//This behavior can be used with any tag and any event.

function canAcceptBehavior(){
  return true;
}



//Returns a Javascript function to be inserted in HTML head with script tags.

function behaviorFunction(){
  return "MM_openBrWindow";
}



//Returns the MM_openBrWindow function call and arguments as
//inputted by the user. The function call is inserted in the
//HTML tag after the selected event
//(<TAG...onEvent="functionCall(arg,arg,arg)">).

function applyBehavior() {
  var i,theURL,theName,arrayIndex = 0;
  var argArray = new Array; //use array to produce correct number of commas w/o spaces
  var checkBoxNames = new Array("toolbar","location","status","menubar","scrollbars","resizable");

  for (i=0; i<checkBoxNames.length; i++) {
    theCheckBox = eval("document.theForm." + checkBoxNames[i]);
    if (theCheckBox.checked) argArray[arrayIndex++] = (checkBoxNames[i] + "=yes");
  }
  if (document.theForm.width.value)
    argArray[arrayIndex++] = ("width=" + document.theForm.width.value);
  if (document.theForm.height.value)
    argArray[arrayIndex++] = ("height=" + document.theForm.height.value);
  theURL = dw.doURLEncoding(document.theForm.URL.value);
  theName = document.theForm.winName.value;
  if (badChars(theName)) return MSG_BadChars;
  else return "MM_openBrWindow('"+theURL+"','"+theName+"','"+argArray.join()+"')";
}



//Returns a dummy function call to inform Dreamweaver the type of certain behavior
//call arguments. This information is used by DW to fixup behavior args when the
//document is moved or changed.
//
//It is passed an actual function call string generated by applyBehavior(), which
//may have a variable list of arguments, and this should return a matching mask.
//
//The return values are:
//  URL     : argument could be a file path, which DW will update during Save As...
//  NS4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  IE4.0ref: arg is an object ref that may be changed by Convert Tables to Layers
//  other...: argument is ignored

function identifyBehaviorArguments(fnCallStr) {
  var argArray;

  argArray = extractArgs(fnCallStr);
  if (argArray.length == 4) {
    return "NAV,other,other";
  } else {
    return "";
  }
}



//Upon returning to the Behavior Inspector after applying a behavior,
//inspectBehavior is called. It looks at the user's HTML document,
//extracts the values from the behavior handler, and inserts them into
//the form UI.

function inspectBehavior(enteredStr) {
  var i;
  var argArray = extractArgs(enteredStr);

  if (argArray.length == 4) {  //first arg is fn name, so ignore that
    document.theForm.URL.value = unescape(argArray[1]);
    document.theForm.winName.value = argArray[2];
    var featuresStr = argArray[3];
    var tokArray = getTokens(featuresStr, "=,");

    var checkBoxNames = new Array("toolbar","location","status","menubar","scrollbars","resizable");
    for (i in checkBoxNames) {
      if (featuresStr.indexOf(checkBoxNames[i]) != -1)
        theCheckBox = eval("document.theForm." + checkBoxNames[i] + ".checked = true");
    }
    for (i=0; i < (tokArray.length-1); i++) {
      if (tokArray[i] == "height") document.theForm.height.value = tokArray[i+1];
      if (tokArray[i] == "width")  document.theForm.width.value = tokArray[i+1];
    }
  }
}



//***************** LOCAL FUNCTIONS  ******************


//Set the insertion point

function initializeUI(){
  document.theForm.URL.focus(); //set focus on textbox
  document.theForm.URL.select(); //set insertion point into textbox
}
