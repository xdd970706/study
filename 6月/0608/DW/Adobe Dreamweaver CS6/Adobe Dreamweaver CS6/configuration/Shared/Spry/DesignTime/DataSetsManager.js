// DataSetsManager.js

/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2007 Adobe Systems Incorporated
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
**************************************************************************/

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.DataSets.Manager
//
// DESCRIPTION:
//	This is the DesignTime Manager for all spry data sets, it keeps track of
//	all spry data sets on the page.
//
//
// PUBLIC METHODS:
//
//   Constructor:
//
//       Manager(dom)
//
//   Utils:
//      inspectDataSet(dsName)
//      findAllDataSets()
//      getDataSet(dsName)
//      setDataSet(dsName, dsObj)
//      deleteDataSet(dsName)
//      getAllDataSets(dsType)
//      parsedOptions(optionsObj)
//
//   Static Utility Functions:
//      getManagerForDocument(dom)
//-----------------------------------------------------------------------

if( typeof Spry == 'undefined' ) Spry = {};
if( typeof Spry.DesignTime == 'undefined' ) Spry.DesignTime = {};
if( typeof Spry.DesignTime.DataSets == 'undefined' ) Spry.DesignTime.DataSets = {};


//--------------------------------------------------------------------
// FUNCTION:
//   Manager
//
// DESCRIPTION:
//   Constructor function for the datasets Manager object.
//
// ARGUMENTS:
//   dom - (object) document element to which this manager is attached
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager = function(dom)
{
	this.dom = dom;
	this.dataSets = new Object();
};

//****************************** STATIC PROPERTIES **********************

Spry.DesignTime.DataSets.Manager.builtInTokens  = ["ds_RowID","ds_CurrentRowID","ds_RowCount"];
Spry.DesignTime.DataSets.Manager.SPRY_DATASET_IMG_FILENAME = "SpryDataSet.gif";
//--------------------------------------------------------------------
// FUNCTION:
//   getManagerForDocument
//
// DESCRIPTION:
//   Static function that retrieves the Data set manager for the specified document, if no manager 
//  is found a new one it will be created.
//
// ARGUMENTS:
//   dom - (object) document element
//
// RETURNS:
//   (Spry.DesignTime.DataSets.Manager) - the manager attached to specified document
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager.getManagerForDocument = function(dom)
{
	if( typeof dom == 'undefined' )
	{
		return;
	}
	
	if( typeof dom.Spry == 'undefined' ) dom.Spry = {};
	if( typeof dom.Spry.DataSets == 'undefined' ) dom.Spry.DataSets = {};
	if( typeof dom.Spry.DataSets.Manager == 'undefined' ) dom.Spry.DataSets.Manager = new Spry.DesignTime.DataSets.Manager(dom);

	return dom.Spry.DataSets.Manager;
};

//--------------------------------------------------------------------
// FUNCTION:
//   inspectDataSet
//
// DESCRIPTION:
//   This function search and extract the options for the specified dataset and construct
//  a design-time object for that dataset. 
//
// ARGUMENTS:
//   dsName - (string) data set name 
//
// RETURNS:
//   (Spry.DesginTime.DataSet) - a generic design-time object, or null if the data set was not found 
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager.prototype.inspectDataSet = function(dsName)
{
  var theDOM = Spry.DesignTime.DataSets.Manager.dom;
	var dsRegExpStr  = "(?:var\\s*)?(" + dsName + ")\\s*=\\s*new\\s*Spry\\.Data\\.((?:XML|HTML)DataSet)\\s*\\(\\s*(?:(null)|[\"']*(.*?)[\"']*)\\s*,\\s*[\"'](.*?)[\"']\\s*(?:,\\s*(\\{.*?\\}))?\\s*\\)";
	var dsRegExp = new RegExp(dsRegExpStr,"ig");
  var dsType = Spry.DesignTime.DataSet.XMLDataSetType;

	if (theDOM == null)
	{
		theDOM = dw.getDocumentDOM();
	}
	if (theDOM != null)
	{
		var jsScriptBlocks = theDOM.getElementsByTagName("script");
		for (var i=0; i < jsScriptBlocks.length; i++)
		{
			var aJSScriptBlock = jsScriptBlocks[i];
			if (aJSScriptBlock != null)
			{
				var jsCode = aJSScriptBlock.innerHTML;
				if ((jsCode != null) && (jsCode.length > 0))
				{
					while (dsRegExp.exec(jsCode))
					{
					  dsType = (RegExp.$2);
					  var dsURL = (RegExp.$3) ? null : RegExp.$4;
					  var dsRootElement = RegExp.$5;
					  var dsOptions = RegExp.$6;
					  var optsArr = Spry.DesignTime.Editing.Utils.getParamsAsStrings(dsOptions, 0, "{", "}", true);
  				  var dsObj;
            if (dsType == Spry.DesignTime.DataSet.XMLDataSetType)
            {
              dsObj = new Spry.DesignTime.XMLDataSet(dsName, dsURL, dsRootElement, this.parsedOptions(optsArr));
            }
            else
            {
              dsObj = new Spry.DesignTime.HTMLDataSet(dsName, dsURL, dsRootElement, this.parsedOptions(optsArr));
            }

  				  if (dsObj)
  				  {
    					var dsColTypeRegExpStr = dsName + "\\.setColumnType\\s*\\([\"']([\\w\\W]*?)[\"'],\\s*[\"'](\\w*)[\"']\\s*\\);";
    					var dsColTypeRegExp = new RegExp(dsColTypeRegExpStr,"ig");
    					var colTypeArr = null;
    					while ((colTypeArr = dsColTypeRegExp.exec(jsCode)) != null)
    					{
                dsObj.setColumnType(dwscripts.unescQuotes(RegExp.$1), RegExp.$2);
    					}
  						this.dataSets[dsType][dsName] = dsObj;
            }
					}
				}
			}
		}
	}
	
	return this.dataSets[dsType][dsName];
};

//--------------------------------------------------------------------
// FUNCTION:
//   findAllDataSets
//
// DESCRIPTION:
//   This function parse the document to which this object is attached to find 
//  all spry data sets.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager.prototype.findAllDataSets = function()
{
  var theDOM = this.dom;
	var dsRegExpStr  = "(?:var\\s*)?(\\w+)\\s*=\\s*new\\s*Spry\\.Data\\.((?:XML|HTML)DataSet)\\s*\\(\\s*(?:(null)|[\"']*(.*?)[\"']*)\\s*,\\s*[\"'](.*?)[\"']\\s*(?:,\\s*(\\{.*?\\}))?\\s*\\)";
	var dsRegExp = new RegExp(dsRegExpStr,"ig");
  var retArray = new Array();
  // reset the datasets
  this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType] = new Object();
  this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType] = new Object();

	if (theDOM == null)
	{
		theDOM = dw.getDocumentDOM();
	}
	
	if (theDOM != null)
	{
		var jsScriptBlocks = theDOM.getElementsByTagName("script");
		for (var i=0; i < jsScriptBlocks.length; i++)
		{
			var aJSScriptBlock = jsScriptBlocks[i];
			if (aJSScriptBlock != null)
			{
				var jsCode = aJSScriptBlock.innerHTML;
				if ((jsCode != null) && (jsCode.length > 0))
				{
				  var arr = null;
					var optsArr = null;
					while (arr = dsRegExp.exec(jsCode) != null)
					{
  				  var dsName = RegExp.$1;
            var dsType = RegExp.$2;
            var dsURL = (RegExp.$3) ? null : RegExp.$4;
            var rootElement = (RegExp.$5);
  				  var optsArr = Spry.DesignTime.Editing.Utils.getParamsAsStrings((RegExp.$6), 0, "{", "}", true);
  				  var dsObj;
            if (dsType == Spry.DesignTime.DataSet.HTMLDataSetType)
            {
              dsObj = new Spry.DesignTime.HTMLDataSet(dsName, dsURL, rootElement, this.parsedOptions(optsArr));
            }
            else
            {
              dsObj = new Spry.DesignTime.XMLDataSet(dsName, dsURL, rootElement, this.parsedOptions(optsArr));
            }
            dsObj.constructDataSet(true);
						this.dataSets[dsType][dsName] = dsObj;
      			retArray.push(new DataSource(dsName, Spry.DesignTime.DataSets.Manager.SPRY_DATASET_IMG_FILENAME, true, "SpryDataSet"));
					}
				}
			}
		}
	}
	
	return retArray;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDataSet
//
// DESCRIPTION:
//   Returns the design-time object for the specified dataset. 
//
// ARGUMENTS:
//	dsName - (string) the name of the data set instance
//
// RETURNS:
//   (object) - the design-time object for the specified dataset
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager.prototype.getDataSet = function(dsName)
{
  var retValue = null;
  if (typeof this.dataSets != "undefined")
  {
  	if (this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType] && this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType][dsName]) 
  	{
      retValue = this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType][dsName];
    }
    else if (this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType] && this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType][dsName]) 
  	{
      retValue = this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType][dsName];
    }
  }

	return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDataSet
//
// DESCRIPTION:
//   Sets the design-time object for the specified dataset.  
//
// ARGUMENTS:
//   dsObj - (string) design-time object of the data set
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager.prototype.setDataSet = function(dsObj)
{
  var dsType = dsObj.getType();
  var dsName = dsObj.getDataSetName();
  
	if( typeof this.dataSets[dsType] == 'undefined' ) 
    this.dataSets[dsType] = new Object();

	this.dataSets[dsType][dsName] = dsObj;
};

//--------------------------------------------------------------------
// FUNCTION:
//   deleteDataSet
//
// DESCRIPTION:
//   Removes the JS code from page for the specified data set.
//
// ARGUMENTS:
//   dsName - (string) data set name
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager.prototype.deleteDataSet = function(dsName)
{
  var dsType = null;
  var assetsFiles = null;
  var otherDSType = null;
  if (typeof this.dataSets != "undefined")
  {
  	if (this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType] && this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType][dsName]) 
  	{
  	  dsType = Spry.DesignTime.DataSet.XMLDataSetType;
  	  otherDSType = Spry.DesignTime.DataSet.HTMLDataSetType;
  	  assetsFiles = this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType][dsName].getAssetsFiles();
    }
    else if (this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType] && this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType][dsName]) 
  	{
  	  dsType = Spry.DesignTime.DataSet.HTMLDataSetType;
  	  otherDSType = Spry.DesignTime.DataSet.XMLDataSetType;
  	  assetsFiles = this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType][dsName].getAssetsFiles();
    }
    
    // remove assets files
    if (dsType && assetsFiles)
    {
      // to avoid multiple undo steps we will make all operations on a temporary dom 
      // than copy the modified content from the temporary dom to the real one
      var tempDOM = dw.getNewDocumentDOM();
      tempDOM.documentElement.outerHTML = this.dom.documentElement.outerHTML;

      if (this.dataSets[dsType][dsName].removeFromPage(tempDOM))
      {
        this.dataSets[dsType][dsName] = null;
      
        // try to see if there are any dataset of the same kind in the page
        var sameDSTypeFound = false;
        for (key in this.dataSets[dsType])
        {
          if (this.dataSets[dsType][key] != null)
          {
            sameDSTypeFound = true;
            break;
          }
        }
        
        if (!sameDSTypeFound)
        {
          var assetsToBeRemoved = new Array();
          // remove assets tha are not shared
          for (var i = 0; i < assetsFiles.length; i++)
          {
            if (!assetsFiles[i].isShared)
            {
              assetsToBeRemoved.push(assetsFiles[i]);          
            }
          }
          var otherDSTypeFound = false;
          for (key in this.dataSets[otherDSType])
          {
            if (this.dataSets[otherDSType][key] != null)
            {
              otherDSTypeFound = true;
              break;
            }
          }
          if (!otherDSTypeFound)
          {
            // remove shared assets
            for (var i = 0; i < assetsFiles.length; i++)
            {
              if (assetsFiles[i].isShared)
              {
                assetsToBeRemoved.push(assetsFiles[i]);          
              }
            }
          }
          
          if (assetsToBeRemoved.length)
          {
            var tags = new Array();
            
            tags = tags.concat(tempDOM.getElementsByTagName("script"));
            tags = tags.concat(tempDOM.getElementsByTagName("link"));
            for (var i = 0; i < tags.length; i++)
            {
  						if (tags[i] && tags[i].getAttribute)
  						{
  							// Get the value to search; the attribute is different according to tag name: script or link
  							var valueToSearch = tags[i].getAttribute("src");
  							if (!valueToSearch)
  							{
  								valueToSearch = tags[i].getAttribute("href");
  							}
  							if (valueToSearch)
  							{
  								for (var j = 0; j < assetsToBeRemoved.length; j++)
  								{
  									if (assetsToBeRemoved[j].refType)
  									{
  										// If the current tag's value matches an asset we'll remove the tag from page
  										if (valueToSearch.match && valueToSearch.match(new RegExp("(?:^|[\\/\\\\])" + dwscripts.escRegExpChars(assetsToBeRemoved[j].destURL) + "$", "gi")))
  										{
                        tags[i].outerHTML = "";
  										}
  									}
  								}
  							}
  						}
            }
          }
        }
        // update the actual content
        this.dom.documentElement.outerHTML = tempDOM.documentElement.outerHTML;
      }
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getAllDataSets
//
// DESCRIPTION:
//   Retrieves an associative array whit all data sets, for the specified type.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (array) - list whit all design-time objects
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager.prototype.getAllDataSets = function()
{
  var retArray = new Array();
  
  if (this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType])
  {
    retArray = retArray.concat(this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType]);
  }
  
  if (this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType])
  {
    retArray = retArray.concat(this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType]);
  }
  
	return retArray;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getAllDataSetNames
//
// DESCRIPTION:
//   Retrieves a list with all data set names from current document.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (array) - list whit all data set names
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager.prototype.getAllDataSetNames = function()
{
  var retArray = new Array();
  if (typeof this.dataSets != "undefined")
  {
    if (this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType])
    {
      for (var key in this.dataSets[Spry.DesignTime.DataSet.XMLDataSetType])
      {
        retArray.push(key);
      }
    }
    if (this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType])
    {
      for (var key in this.dataSets[Spry.DesignTime.DataSet.HTMLDataSetType])
      {
        retArray.push(key);
      }
    }
  }
  
  return retArray;
};


//--------------------------------------------------------------------
// FUNCTION:
//   parsedOptions
//
// DESCRIPTION:
//   This function gets as parameter the third optional argument of the data set 
//  and transforms it into a javascript object that is suitable for the design-time object.
//
// ARGUMENTS:
//   optionsObj - (array) third data set parameter 
//
// RETURNS:
//   (object) - data set design-time options 
//--------------------------------------------------------------------
Spry.DesignTime.DataSets.Manager.prototype.parsedOptions = function(optionsObj)
{
  var parsedOptions = new Object();
  for (var i = 0; i < optionsObj.length; i++)
  {
    try{
      var strOption = optionsObj[i];
      if (strOption)
      {
        var arrSplit = strOption.split(":");
        parsedOptions[arrSplit[0]] = eval(arrSplit[1].replace(/^\s*/g, "").replace(/\s*$/g, "")); // trim
      }
     }catch(e){
      // when evaluating expressions, errors may occur
      // we will skip those errors and will remove the option that generated that error
     } 
  }
  
  return parsedOptions;
}
