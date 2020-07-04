//SHARE-IN-MEMORY=true
//Copyright 2000-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.

function replaceOriginalEncoding(origAttr)
{
	re1 = /%22/g;
	re2 = /%3C/gi;
	re3	= /%3E/gi;
	re4 = /%25/g;
	origAttr = origAttr.replace(re1, "\"");
	origAttr = origAttr.replace(re2, "<");
	origAttr = origAttr.replace(re3, ">");
	origAttr = origAttr.replace(re4, "\%");
	
	return origAttr;
}

function unescapequote(aVal)
{
	aVal = unescape(aVal);
	if ((aVal.charAt(0) == '"' && aVal.charAt(aVal.length - 1) == '"') ||
		(aVal.charAt(0) == "'" && aVal.charAt(aVal.length - 1) == "'"))
	{
		aVal = aVal.substring(1,aVal.length - 1)
	}
	return aVal;
}

function IsNodeInsideRange(range,node)
{
	var theDOM = dreamweaver.getDocumentDOM("document");
	var rangeselection = theDOM.nodeToOffsets(range);
	var nodeselection =  theDOM.nodeToOffsets(node);
	if ((nodeselection[0] == rangeselection[0])
		|| (nodeselection[1] == rangeselection[1]))
	{
		return true;
	}
	return false;
}

////////////////////////////////////////////////////////////
//This function checks for duplicate Object Names
////////////////////////////////////////////////////////////
function CheckForDuplicateNames(tagType,Name)
{
	if (CheckForDuplicateNames.arguments.length > 2)
		myNode = CheckForDuplicateNames.arguments[2];
	else
		myNode = null;
		
	var tagTypeAsArray = new Array().concat(tagType);
	var theRRObj = null;
	var RRnodes = new Array();
	for (var i=0; i<tagTypeAsArray.length; i++) {
		RRnodes = RRnodes.concat(dw.getDocumentDOM().getElementsByTagName(tagTypeAsArray[i]));
	}

	if (myNode) {
		//Make sure this node is valid-not some suprious call.
		var found = false;
		for (i=0;i<RRnodes.length;i++) {
			if (RRnodes[i] == myNode) {
				found = true;
			}
		} 
		if (!found) return false;
	}

	for (var index =0 ; index < RRnodes.length ; index++)
	{
		node = RRnodes[index];
		if ((node) && (myNode != node))
		{
			if (Name == node.getAttribute("NAME"))
			{
				return true;
			}
		}
	}

	return false;
}

function isDoubleByteEncoding()
{
    if (!dw.getDocumentDOM())
        return false;

	var charSet = dw.getDocumentDOM().getCharSet();
	charSet = charSet.toLowerCase();

	if (charSet == "shift_jis" || charSet == "x-sjis" || charSet == "euc-jp" || charSet == "iso-2022-jp" ||
		charSet == "euc-kr" || charSet == "big5" || charSet == "gb2312") 
		return true;
	else
		return false;
}

function isDoubleByteOrUtf8Encoding()
{
    if (!dw.getDocumentDOM())
        return false;

	var charSet = dw.getDocumentDOM().getCharSet();
	charSet = charSet.toLowerCase();

	if (charSet == "utf-8" || isDoubleByteEncoding()) 
		return true;
	else
		return false;
}
