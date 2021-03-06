// Copyright 2001-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.
var DEBUG = false
var session_filename = "SES_D.gif"
var datasourceleaf_filename = "DSL_D.gif"

function addDynamicSource()
{
  MM.retVal = "";
  MM.sessionContents = "";
  dw.popupCommand("Session Variable");
  if (MM.retVal == "OK") {
    var theResponse = MM.sessionContents;
    if (theResponse.length) {
      var siteURL = dw.getSiteRoot();
      if (siteURL.length){
        addValueToNote(siteURL,"sessionCount","Session",theResponse, true);   
      }
      else{
        alert(MM.MSG_DefineSite);
      }
    }
    else {
      alert(MM.MSG_DefineSession);
    }
  }
}


function findDynamicSources()
{
  var DSL = new Array();
  var siteURL = dw.getSiteRoot()

  if (siteURL.length){
    var SBindingsArray = new Array();
    getValuesFromNote(siteURL,SBindingsArray,"Session","sessionCount");
    if (SBindingsArray.length > 0) {
      DSL.push(new ObjectInfo(MM.LABEL_Session, session_filename, false, "Session.htm",""))
    }
  }

  return DSL;
}

////////////////////////////////////////////////////////////////////////////////
//  Function: generateDynamicSourceBindings()
//
//  Returns a list of bindings for elementNode on the page.
////////////////////////////////////////////////////////////////////////////////
function generateDynamicSourceBindings(elementName, singleArray)
{
  var BindingsArray = new Array();
  var outArray;

  var siteURL = dw.getSiteRoot()

  if (siteURL.length){
    //For localized object name
    if (elementName != "Session")     
      elementName = "Session"

    getValuesFromNote(siteURL,BindingsArray,elementName,"sessionCount");
    outArray = GenerateObjectInfoForSourceBindings(BindingsArray, datasourceleaf_filename, "Session.htm","");
  }
    
  return outArray;

}


////////////////////////////////////////////////////////////////////////////////
//
//  Function: generateDynamicDataRef
//
//  Returns a dynamic binding string.
////////////////////////////////////////////////////////////////////////////////
function generateDynamicDataRef(elementName,bindingName,dropObject)
{
  retStr = "<%= Session(\"" + bindingName + "\") %>";

  // If the string is being inserted inside a script block, strip the
  // script delimiters.
  if (dwscripts.canStripScriptDelimiters(dropObject))
    retStr = dwscripts.stripScriptDelimiters(retStr);

  return retStr;
}


////////////////////////////////////////////////////////////////////////////////
//
//  Function: inspectDynamicDataRef
//
//  Inspects a dynamic binding string and returns a pair of source and binding.
////////////////////////////////////////////////////////////////////////////////
function inspectDynamicDataRef(expression)
{
  var retArray = new Array();
  if(expression.length) {

    // Quickly reject if the expression doesn't contain "<%="
    var exprIndex = expression.indexOf("<%=");
    if (exprIndex != -1)
    {
      // No need to search the string prior to the "<%="
      expression = expression.substr(exprIndex);

      var TranslatorDOM = dreamweaver.getDocumentDOM(dreamweaver.getConfigurationPath() + "/Translators/ASP.htm");
      if (TranslatorDOM)  {
        TranslatedStr = TranslatorDOM.parentWindow.miniTranslateMarkup("", "", expression, false);
        if (TranslatedStr.length)
        {
          var found = TranslatedStr.search(/mm_dynamic_content\s+source=(\w+)\s+binding="([^"]*)"/i)
          if (found != -1)
          {
            retArray[0] = RegExp.$1
            retArray[1] = RegExp.$2
            //alert("source=" + retArray[0] + " binding=" + retArray[1])
          }
        }
      }
    }
  }
    
  return retArray;
}


////////////////////////////////////////////////////////////////////////////////
//
//  Function: deleteDynamicSource
//
//  Deletes a dynamic source from the document.
////////////////////////////////////////////////////////////////////////////////
function deleteDynamicSource(sourceName,bindingName)
{
    var siteURL = dw.getSiteRoot();
      if (siteURL.length){

    //For localized object name
    if (sourceName != "Session")      
      sourceName = "Session"

    deleteValueFromNote(siteURL,"sessionCount",sourceName,bindingName);
  }
}
