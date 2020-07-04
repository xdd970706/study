// DocUtils(doc)
//
// NOTE:
//
// Mostly was found in an inner class (DocInfo) within
// Shared/OAWidget/OAWidgetManager.js
//
// DESCRIPTION:
//
// The constructor for an object that contains references
// to the specified document's head, body and edit regions.
// The object also exposes some common utilities.
//
// ARGUMENTS:
//
// doc - The document DOM element.
//
// RETURNS:
//
// N/A

function DocUtils(doc)
{
    this.doc = doc;
    this.head = doc.getElementsByTagName("head")[0];
    this.body = doc.getElementsByTagName("body")[0];
    this.isTemplateInstance = doc && doc.getAttachedTemplate().length > 0;
    this.headEditRgns = null;
    this.bodyEditRgns = null;

    if (this.isTemplateInstance)
    {
        if (this.head)
            this.headEditRgns = DocUtils.slowGetElementsByTagName(this.head, "MMTINSTANCE:EDITABLE", true);
        if (this.body)
            this.bodyEditRgns = DocUtils.slowGetElementsByTagName(this.body, "MMTINSTANCE:EDITABLE", true);
    }
}

DocUtils.getDocInfo = function(doc) {
    return new DocUtils.DocInfo(doc);
};

// headIsEditable()
//
// DESCRIPTION:
//
// A utility method that returns a true if the document
// is a non-template instance, or if it is a template instance,
// when it contains at least one editable region in its head.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// Boolean true or false.

DocUtils.prototype.headIsEditable = function()
{
    if (this.head)
    {
        if (this.isTemplateInstance)
            return (this.headEditRgns && this.headEditRgns.length > 0);
        return true;
    }
    return false;
}

// bodyIsEditable()
//
// DESCRIPTION:
//
// A utility method that returns a true if the document
// is a non-template instance, or if it is a template instance,
// when it contains at least one editable region in its body.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// Boolean true or false.

DocUtils.prototype.bodyIsEditable = function()
{
    if (this.body)
    {
        if (this.isTemplateInstance)
            return (this.bodyEditRgns && this.bodyEditRgns.length > 0);
        return true;
    }
    return false;
}

// getElementsPreOrder(node, arr)
//
// DESCRIPTION:
//
// Utility function that returns an array of all elements in the
// sub-tree rooted by the specified node. The nodes in this array
// are arranged in pre-order.
//
// ARGUMENTS:
//
// node - A DOM node/element.
// arr - The array that will store the results.
//
// RETURNS:
//
// The array that contains the pre-ordered results.

DocUtils.getElementsPreOrder = function(node, arr)
{
    if (!arr)
        arr = [];
    if (node && node.nodeType == 1)
    {
        arr.push(node);
        var c = node.firstChild;
        while (c)
        {
            DocUtils.getElementsPreOrder(c, arr);
            c = c.nextSibling;
        }
    }

    return arr;
}

// slowGetElementsByTagName(container, tagName, caseSensitiveLookup)
//
// DESCRIPTION:
//
// Utility function that acts just like the built-in getElementsByTagName()
// method on an element, except that this version can find built-in MM:tags.
//
// ARGUMENTS:
//
// container - Object. The DOM element to find tags in.
// tagName - String. The name of the tag to look for.
// caseSensitiveLookup - Boolean. If true requires that tagNames match exactly in terms of characters and case.
//
// RETURNS:
//
// An array with properties and methods that make it look like a NodeList.

DocUtils.slowGetElementsByTagName = function(container, tagName, caseSensitiveLookup)
{
    // We want this function to mimic what the real getElementsByTagName()
    // returns, so we build a return object with the same API.

    var nodeList = new Object;
    nodeList._arr = new Array();
    nodeList.length = 0;
    nodeList.item = function(i) { return nodeList._arr[i]; }

    var tagName = caseSensitiveLookup ? tagName.toLowerCase() : tagName;
    var eleArr = DocUtils.getElementsPreOrder(container);

    // The first element in eleArr will be the container element we gave
    // to getElementsPreOrder. We want to skip that so make sure we start
    // an index of 1 in our loop below.

    for (var i = 1; i < eleArr.length; i++)
    {
        var ele = eleArr[i];
        var nodeName = caseSensitiveLookup ? ele.nodeName.toLowerCase() : ele.nodeName;
        if (tagName == nodeName)
        {
            nodeList._arr.push(ele)
            ++nodeList.length;
        }
    }

    return nodeList;
}