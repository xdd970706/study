// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

//---------------   GLOBAL VARIABLES   ---------------
var OBJECT_FILE = dw.getConfigurationPath() + '/commands/SpryValidationTextarea.htm';
var helpDoc = MM.HELP_objSpryValidationTextarea;
var RETURN_TAG='';
var SCRIPT_STR='';
var ASSET_LIST={};
var ID;

//---------------     API FUNCTIONS    ---------------

function isDOMRequired() 
{ 
  // Return false, indicating that this object is available in code view.
  return false;
}

function createWidget() 
{
  var dom = dw.getDocumentDOM();
  var selNode = dom.getSelectedNode();
  ASSET_LIST = new Array();
  RETURN_TAG='';
  SCRIPT_STR='';
  ID = Spry.DesignTime.Editing.Utils.getNewJSObjectName("Spry.Widget.ValidationTextarea", "sprytextarea");
  var opts = new Object();
  
  var sel = dom.getSelection(true);
  
  if( !Spry.DesignTime.Editing.Utils.canInsertWidget(dom) )
  {
    return;
  }
  
  var tagSnippet = Spry.DesignTime.Widget.ValidationTextarea.getTagSnippet(selNode);
  if (Spry.DesignTime.Widget.ValidationTextarea.checkNode(selNode))
  {
    //don't call returnformtag function if a select control is selected
    tagStr = tagSnippet;
  }
  else
  {
    tagStr = returnFormTag(tagSnippet);
  }

  if ( !tagStr )
    return;
 
  // Construct the assets list using the array of assets returned by the static getAssets() function
  var assets = Spry.DesignTime.Widget.ValidationTextarea.getAssets();
  for (var i=0; i<assets.length; i++)
  {
    var assetInfo = new AssetInfo(assets[i].fullPath, assets[i].file, assets[i].type);
    ASSET_LIST.push(assetInfo);
  }
  /*
  assetInfo = new AssetInfo("Shared/Spry/Widgets/ValidationTextarea/SpryValidationTextarea.js", "SpryValidationTextarea.js", "javascript");
  ASSET_LIST.push(assetInfo);
  
  assetInfo = new AssetInfo("Shared/Spry/Widgets/ValidationTextarea/SpryValidationTextarea.css", "SpryValidationTextarea.css", "link");
  ASSET_LIST.push(assetInfo);
  */
 
  SCRIPT_STR = Spry.DesignTime.Widget.ValidationTextarea.getNewValidationTextareaConstructorSnippet(ID);
  RETURN_TAG = Spry.DesignTime.Widget.ValidationTextarea.getNewValidationTextareaSnippet(ID, opts, tagStr);
  
  if( selectionIsContainedInTagOfType(sel, "MMTEMPLATE:IF", dom, false) )
  {
    // We're in a conditional tag, just insert the script tag right after the widget.
    RETURN_TAG = RETURN_TAG + "<script type=\"text/javascript\">\n" + SCRIPT_STR + "\n</script>";
    SCRIPT_STR = '';
  }
}

function createWidgetStr()
{
  return RETURN_TAG;
}

function getScriptStr()
{
  return SCRIPT_STR;
}

function getAssetList()
{
  return ASSET_LIST;
}

function getWidgetID() {
  return ID;
}
