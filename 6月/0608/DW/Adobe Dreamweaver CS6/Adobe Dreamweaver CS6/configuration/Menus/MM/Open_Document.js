// Copyright 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved.
// Menu Command API for Open_Document.htm

//******************** GLOBALS **************************
var domRequired = true;
var focusWnd = "";

//********************** API ****************************
function isDOMRequired()
{
  focusWnd = dw.getFocus(true);
  return domRequired;   
}

function receiveArguments()
{
	var inArg = "";
	var absPath = "";
	
    if (arguments[0] == 'openAsTopDoc')
    {
    	// If this is called RelatedFile tab for "Open As Top Document", 
	    // it must have a valid URL.
    	var forContextMenu = true;    // Get name selected by ContextMenu not necessary active Related File.
    	var fileURL = dw.getActiveRelatedFilePath(forContextMenu);
        if (fileURL.length)
        {
            openDocument(fileURL);
        }
        
        return; // We are done for "open as top doc"
    }	
    
	if (arguments.length)
	{
		if (arguments[0]=="DWShortcuts_HTMLSource_OpenDocument")
		{
			inArg = getOpenDocumentName();
		}
		else
		{
			inArg = arguments[0];
	    }
	}
		
	if(inArg && inArg.length)
	{
		var protocollist = new Array();

		protocollist.push("http://");
		protocollist.push("https://");
		protocollist.push("mailto:");

		var bHandled=false;
		for (var i=0;i<protocollist.length;i++)
		{
			if (inArg.indexOf(protocollist[i]) != -1)
			{
				//open in primary browers
				dw.browseDocument(inArg);
				bHandled=true;
				break;
			}
		}

		if (!bHandled)
		{
			if (inArg[0] == "/")
			{
				var aDOM = dw.getDocumentDOM();
				if (aDOM != null)
				{
					var locAbsPath = aDOM.siteRelativeToLocalPath(inArg);
					absPath = dwscripts.filePathToLocalURL(locAbsPath); // Consisntent wth doc relative case.
				}
			}
			else
			{
				var docPath  = dw.getDocumentDOM().URL;
				absPath = dw.relativeToAbsoluteURL(docPath,"",inArg);
			}
		}

        // If this is one of the RelatedFiles, open as Realted File.
        if (FoundInRelatedFiles(absPath))
           dw.openRelatedFile(absPath);
        else 
		    openDocument(absPath);
	}
	else if(dw.canPopupCodeNavigator())
	{  
	    dw.setFocus(focusWnd);
        dw.popupCodeNavigator();
	}
}

function isCommandChecked()
{
	return false;
}

function canAcceptCommand()
{
  var retVal = false;
  var caller = arguments[0];
  
  if (dw.getDocumentDOM() != null)
  {
	// Check this if this is called for Open in RelatedFile Tabs.
    if (caller == 'openAsTopDoc')
    {
        domRequired = false;
		var forContextMenu = true;     // Get name selected by ContextMenu not necessary active Related File.
        var activeRelatedFileURL = dw.getActiveRelatedFilePath(forContextMenu);
        if (activeRelatedFileURL.length)
        {
            // #230607. Gray-out the menu if the RelatedFile is a 
            // remote file. We don't want to open up a local temp file.
            if ((activeRelatedFileURL.indexOf("http://") != -1)
                || (activeRelatedFileURL.indexOf("https://") != -1))
                retVal = false;
            else
                retVal = true;
        }
    }
    else
    {
  	    var docName = getOpenDocumentName();
	    if (docName.length)
	    {
  		    retVal = true;
  	    }
  	    else  if(dw.canPopupCodeNavigator())
  	    {
  		    retVal = true;
  	    }
  	}
  }
	return retVal;
}

function getDynamicContent(itemID)
{
  var openDocName = new Array();
	var docName = getOpenDocumentName();
	if (docName.length)
	{
		docName = docName.replace(/_/g,"%|");
		openDocName[0] = OpenDocument + " \"" + docName + "\"";
		openDocName[0]  += "\tCmd+D";
		openDocName[0]  += ";id='" + "DWShortcuts_HTMLSource_OpenDocument" + "'";
	}
	else
	{
		openDocName[0] = OpenDocument;
		openDocName[0]  += "\tCmd+D";
		openDocName[0]  += ";id='" + OpenDocument + "'";
	}
  return openDocName;
}


function getOpenDocumentName()
{
	var retStr = "";
	var dom = dw.getActiveWindow(true);
	
	if (dom == null)
		return retStr;
		
	var selection = dom.source.getSelection();

	if (selection[0] == selection[1])
	{
		var lines =   dom.source.getCurrentLines(selection[0],selection[1]);
		var offsets = dom.source.getOffsetsFromLine(lines[0]);
		retStr	= dom.source.getText(offsets[0],offsets[1]);

		//check for string under cursor is under quotes ...if yes use that 
		//string else try to find the first quoted string in the line.
		//scan for first quotes- if quotes are not there ..give up.

		var sufinger = StringUnderTextFinger(retStr,selection[0]-offsets[0]);
		if (sufinger.length)
		{
				retStr = sufinger;
		}
		else
		{
			var re  = /'([^']*)'|"([^"]*)|url\((.*?)\)"/g;
			var index = retStr.search(re);
			if (index != -1)
			{
				if (RegExp.$1.length)
				{
					retStr = RegExp.$1;
				}
				else if( RegExp.$2.length )
				{
					retStr = RegExp.$2;
				}
				else
				{
					retStr = RegExp.$3;
				}
			}
			else
			{
				retStr = "";
			}
		}
	}
	else
	{
		retStr	= dom.source.getText(selection[0],selection[1]);
		//scan for first quotes- if quotes are not there ..using the selection.
		var re  = /'([^']*)'|"([^"]*)|url\((.*?)\)"/g;
		var index = retStr.search(re);
		if (index != -1)
		{
			if (RegExp.$1.length)
			{
				retStr = RegExp.$1;
			}
			else if( RegExp.$2.length )
			{
				retStr = RegExp.$2;
			}
			else
			{
				retStr = RegExp.$3;
			}
		}
	}

	// check for newlines...if there are newlines, we can ignore it.
	if (retStr.length)
	{
		var re = /\n|\r/g;
		var index = retStr.search(re);
		if (index != -1)
		{
			retStr = "";
		}
	}

	//make sure that there is file extension..if not we can ignore it safely.
	if (retStr.length)
	{
		var extIndex		= retStr.lastIndexOf(".");
		var bHasExtension	= false;
        var atIndex         = retStr.lastIndexOf("@"); 
		var funcbeginIndex  = retStr.lastIndexOf("("); 
		var funcendIndex    = retStr.lastIndexOf(")"); 
		var hashBeginIndex  = retStr.indexOf("#");
		var hashEndIndex	= retStr.lastIndexOf("#"); 
		var bIsVariable		= false;

		if (extIndex != -1)
		{
			// a valid extension will consist only of non-whitespace characters.
			var extension = retStr.substring(extIndex+1);
			var re = /\S+/;
			var index = extension.search(re);
			if (index == 0)
			{
				bHasExtension = true;
			}
		}

		if ((hashBeginIndex != -1) && ( hashEndIndex!= -1))
		{
			if (hashBeginIndex != hashEndIndex)
			{	
				bIsVariable = true;	
			}
		}

		if (bHasExtension && atIndex == -1 && funcbeginIndex == -1 && funcendIndex == -1 && !bIsVariable)
		{
			retStr  = dwscripts.trim(retStr);
		}
		else
		{
			retStr = "";	
		}
	}
	return retStr;
}

function StringUnderTextFinger(retStr,fingeroffset)
{
	var sufingertext = "";
	if (retStr && retStr.length)
	{
			var re  = /'[^']*'|"[^"]*"|url\(.*?\)/g;
			var arr;
			while ((arr = re.exec(retStr)) != null)
			{
				 var beginoffset=arr.index;
				 var endoffset = arr.index + arr[0].length;

				 if ((beginoffset <= fingeroffset) && 
						(fingeroffset<=endoffset))
				 {
						sufingertext = 	arr[0];
						if( sufingertext.indexOf("url(") == 0 )
						{
							//found the url() case
							sufingertext = sufingertext.substring(4, sufingertext.length-1);
						}
						sufingertext =  dwscripts.trimQuotes(sufingertext);
				 }
			}
  }

	return sufingertext;
}


function openDocument(absPath)
{
	var extIndex		= absPath.lastIndexOf(".");
	var bHandled = false;
	if (extIndex != -1)
	{
		var extension = absPath.substring(extIndex+1);
		if (extension.length)
		{
			extension=extension.toUpperCase();
			// first try to map extension to another app since that is how 
			// the site would handle it if we were to double-click the 
			// file from the local site view - if there is no external editor
			// or if dw is supposed to handle it (for instance because 
			// the extension is found in the preferences Open As Text), 
			// then getPrimaryExtensionEditor will return an empty array
			var extEditArray = dw.getPrimaryExtensionEditor(absPath);
			if (extEditArray.length == 2)
			{
				dw.openWithApp(absPath,extEditArray[1]);
				bHandled = true;
			}

			// if no external editor, then open it in dw
			if (!bHandled)
			{
				var extList = dw.getExtensionsList();
				for (var i=0 ; i < extList.length ; i++)
				{
					if (extList[i] == extension)
					{
						dw.openDocument(absPath);
						bHandled = true;
						break;
					}
				}
			}

			// one final case, if the file extension is not normally 
			// handled by DW (so it is not in dw.getExtensionList), 
			// but it is found in the Open As Text preference, 
			// then we should open it with dreamweaver
			if (!bHandled)
			{
				var openAsText = dw.getPreferenceString("Helper Applications Preferences", "Open As Text");
				var extlen = extension.length+1;
				var n = openAsText.toLowerCase().indexOf("."+extension.toLowerCase());
				if (n >= 0 && (openAsText.length == n+extlen || ' ' == openAsText.charAt(n+extlen)))
				{
					dw.openDocument(absPath);
					bHandled = true;
				}
			}
		}
	}
	return bHandled;
}


function FoundInRelatedFiles(filename)
{
    var found = false;

	// Get the list of RelatedFiles
	UseMenuNames = false;
	var docList = dw.getRelatedFiles(UseMenuNames);
  
	if (docList.length > 0)
	{
	    var encodrdStr = dw.doURLEncoding(filename,"", true);
		for (i = 0; i < docList.length; i++)
		{
		    // Remove the path, and show filenames only.
		   	if (docList[i] == encodrdStr)
			    found = true;
		}
	}

	return found;
}
