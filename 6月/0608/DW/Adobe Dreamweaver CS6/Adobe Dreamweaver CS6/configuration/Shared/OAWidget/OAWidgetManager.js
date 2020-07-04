/*******************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright (c) 2009. Adobe Systems Incorporated.
* All rights reserved.
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

function OAWidgetInstance(doc, exchangeID, binding)
{
    this.doc = doc;
    this.widgetID = exchangeID;
    this.binding = binding;
}

// OAWidgetManager()
//
// DESCRIPTION:
//
// Constructor for the widget manager object. Each document loaded into
// Dreamweaver will have its own widget manager. The widget manager is responsible
// for loading and caching OAM files, and for maintaining the refcount for
// all OAM widgets on the page.
//
// Developers do not instantiate the OAWidgetManager constructor directly. Instead,
// they call OAWidgetManager.getManagerForDoc() which insures that only one widget
// manager is ever created for a given document.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// N/A

function OAWidgetManager(doc)
{
    this.doc = doc;
    this.assetDependentDict = {};
    this.widgetCache = {};
    this.idCache = {};
    this.iconCache = {};
}

// getManagerForDoc(doc)
//
// DESCRIPTION:
//
// Returns the OAWidgetManager object for the specified document. If one doesn't
// exist, it creates one and attaches it to the document to insure that only one
// instance is ever created for a given document.
//
// ARGUMENTS:
//
// doc - The document DOM element.
//
// RETURNS:
//
// Returns an OAWidgetManager object.

OAWidgetManager.getManagerForDoc = function(doc)
{
    var mgr = doc.OAWidgetManager;
    if (!mgr)
    {
        mgr = doc.OAWidgetManager = new OAWidgetManager(doc);
    }
    return mgr;
};

OAWidgetManager.prototype.getManagerForDoc = OAWidgetManager.getManagerForDoc;


// getDocInfo(doc)
//
// DESCRIPTION:
//
// Returns a convenience object that gives immediate access to
// the documents head, body and editable regions.
//
// ARGUMENTS:
//
// doc - The document DOM element.
//
// RETURNS:
//
// Returns DocInfo object.

OAWidgetManager.getDocInfo = function(doc)
{
    return new OAWidgetManager.DocInfo(doc);
};

OAWidgetManager.prototype.getDocInfo = OAWidgetManager.getDocInfo;

// xmlToWidgetList(xmlStr)
//
// DESCRIPTION:
//
// Parses the specified XML string and returns an array of objects
// that contains the widget info for all widgets described in the XML string.
//
// ARGUMENTS:
//
// xmlStr - A string that contains XML that describes the widgets used within a document.
//
// RETURNS:
//
// Returns an Array of Objects.

OAWidgetManager.xmlToWidgetList = function(xmlStr)
{
    var results = [];
    if (xmlStr)
    {
        var dom = dw.getNewDocumentDOM();
        try { dom.documentElement.outerHTML = xmlStr; } catch (e) { dom = null; }
        if (dom)
        {
            var widgetsEle = dom.getElementsByTagName("oa:widgets")[0];
            if (widgetsEle)
            {
                var widgetArr = widgetsEle.getElementsByTagName("oa:widget");
                for (var i = 0; i < widgetArr.length; i++)
                {
                    var w = widgetArr.item(i);
                    var wid = w.getAttribute("wid");
                    var bindingMethod = w.getAttribute("bindingmethod");
                    var binding = w.getAttribute("binding");
                    if (wid && binding)
                    {
                        var o = new Object;
                        o.exchangeID = wid;
                        o.bindingMethod = bindingMethod ? bindingMethod : "selector";
                        o.binding = binding;
                        results.push(o);
                    }
                }
            }
        }
    }
    return results;
};

// getDocumentWidgetList(doc)
//
// DESCRIPTION:
//
// Extracts all of the <oa:widgets> XML embedded within the specified
// document, parses them and returns an array of objects that contain
// info on all of the widgets listed in the XML.
//
// ARGUMENTS:
//
// doc - A DOM document element.
//
// RETURNS:
//
// Returns an Array of Objects.

OAWidgetManager.getDocumentWidgetList = function(doc)
{
    var results = [];

    var scriptTags = doc.getElementsByTagName("script");
    for (var i = 0; i < scriptTags.length; i++)
    {
        var scriptTag = scriptTags.item(i);
        if (!scriptTag.src && scriptTag.type == "text/xml")
        {
            var widgets = OAWidgetManager.xmlToWidgetList(scriptTag.innerHTML.replace(/\s*<!(--|\[CDATA\[)\s*|\s*(--|\]\])>\s*/g, ""));
            results = results.concat.apply(results, widgets);
        }
    }

    return results;
};

// encodeEntities(str)
//
// DESCRIPTION:
//
// Entity encodes all '&', '<', '>' and double quote characters
// in the specified string and returns the results.
//
// ARGUMENTS:
//
// str - A string to encode.
//
// RETURNS:
//
// String.

OAWidgetManager.encodeEntities = function(str)
{
    if (str && str.search(/[&<>"]/) != -1)
    {
        str = str.replace(/&/g, "&amp;");
        str = str.replace(/</g, "&lt;");
        str = str.replace(/>/g, "&gt;");
        str = str.replace(/"/g, "&quot;");
    }

    return str;
};

// setSelectionInsideEnd(ele)
//
// DESCRIPTION:
//
// Sets the document selection to the left of the closing
// tag of the specified element. Note that the document is
// extracted from the element's ownerDocument property.
//
// ARGUMENTS:
//
// ele - A DOM element.
//
// RETURNS:
//
// N/A

OAWidgetManager.setSelectionInsideEnd = function(ele)
{
    if (ele)
    {
        var doc = ele.ownerDocument;
        if (doc)
        {
            // The idea here is to first set the selection around the innerHTML of the node
            // and then collapse it to the end of the resulting selection.

            doc.setSelectedNode(ele, true);
            var offset = doc.getSelection()[1];
            doc.setSelection(offset, offset);
        }
    }
};

// writeWidgetListToDocument(doc, widgetList)
//
// DESCRIPTION:
//
// Writes the specified widgetList into the widget <script> tag
// within the document. If a widget <script> tag exists, it overwrites
// all entries and replaces them with the contents of the specified
// widget list. If the <script> tag does not exist, this function creates
// one at the end of the <head> element and then writes the widget list into it.
//
// ARGUMENTS:
//
// doc - A DOM document element.
// widgetList - An array of widget description objects.
//
// RETURNS:
//
// N/A

OAWidgetManager.writeWidgetListToDocument = function(doc, widgetList)
{
    var removeWidgetList = !widgetList || widgetList.length < 1;

    var widgetListScriptTag = null;
    var scriptTags = doc.getElementsByTagName("script");
    for (var i = scriptTags.length - 1; i >= 0; i--)
    {
        var scriptTag = scriptTags.item(i);
        if (!scriptTag.src && scriptTag.type == "text/xml" && scriptTag.innerHTML.search("<oa:widgets[^>]*>") != -1)
        {
            if (removeWidgetList)
                scriptTag.outerHTML = "";
            else
            {
                widgetListScriptTag = scriptTag;
                break;
            }
        }
    }

    if (removeWidgetList)
        return;

    if (!widgetListScriptTag)
    {
        // Calculate the selection offset that is to the left of the closing </head> tag,
        // place the selection there, then insert an empty widget list. If we are inserting
        // into a template instance document, set the selection at the end of the last editable
        // region in the head and then do the insert.

        var docInfo = OAWidgetManager.getDocInfo(doc);
        if (docInfo.isTemplateInstance)
        {
            // If there is no edit region in the head, insert it into the last editable
            // region of the body.

            var rgns = docInfo.headEditRgns ? docInfo.headEditRgns : docInfo.bodyEditRgns;

            // If we have no editable regions we have no choice but to bail to avoid
            // infinite recursion below.

            if (!rgns)
                return;

            OAWidgetManager.setSelectionInsideEnd(rgns.item(rgns.length - 1));
        }
        else
            OAWidgetManager.setSelectionInsideEnd(doc.getElementsByTagName("head").item(0));

        // Insert the blank list script.

        doc.insertHTML("<script type=\"text/xml\">\n<!--\n<oa:widgets>\n</oa:widgets>\n-->\n</script>\n");

        // Now recurse so that we can find the script element we just inserted.

        return OAWidgetManager.writeWidgetListToDocument(doc, widgetList);
    }

    var output = ["\n<!--\n<oa:widgets>\n"];
    for (var i = 0; i < widgetList.length; i++)
    {
        var w = widgetList[i];
        output.push("  <oa:widget wid=\"" + w.exchangeID + "\"");
        if (w.bindingMethod && w.bindingMethod != "selector")
            output.push(" bindingMethod=\"" + w.bindingMethod + "\"");
        output.push(" binding=\"" + OAWidgetManager.encodeEntities(w.binding) + "\" />\n");
    }
    output.push("</oa:widgets>\n-->\n");
    widgetListScriptTag.innerHTML = output.join("");
};

// addEntryToDocumentWidgetList(doc, widgetID, bindingMethod, binding)
//
// DESCRIPTION:
//
// Adds an entry for the specified widget to the XML widget list <script>
// within the specified document.
//
// ARGUMENTS:
//
// doc - A DOM document element.
// widgetID - The reference ID for the widget to add.
// bindingMethod - The binding method used for the widget.
// binding - The binding info used for the widget.
//
// RETURNS:
//
// N/A

OAWidgetManager.addEntryToDocumentWidgetList = function(doc, widgetID, bindingMethod, binding)
{
    var exchangeID = OAWidgetManager.getExchangeIDForWidgetID(widgetID);
    
    var widgets = OAWidgetManager.getDocumentWidgetList(doc);
    for (var i = 0; i < widgets.length; i++)
    {
        var w = widgets[i];
        if (exchangeID == w.exchangeID && bindingMethod == w.bindingMethod && binding == w.binding)
            return;
    }

    widgets.push({ exchangeID: exchangeID, bindingMethod: bindingMethod, binding: binding });
    OAWidgetManager.writeWidgetListToDocument(doc, widgets);
};

OAWidgetManager.prototype.addEntryToDocumentWidgetList = OAWidgetManager.addEntryToDocumentWidgetList;

// removeEntryFromDocumentWidgetList(doc, widgetID, bindingMethod, binding)
//
// DESCRIPTION:
//
// Removes the specified widget from the XML widget list <script>
// within the specified document.
//
// ARGUMENTS:
//
// doc - A DOM document element.
// widgetID - The reference ID for the widget to remove.
// binding - The binding info used for the widget.
//
// RETURNS:
//
// N/A

OAWidgetManager.removeEntryFromDocumentWidgetList = function(doc, widgetID, bindingMethod, binding)
{
    var exchangeID = OAWidgetManager.getExchangeIDForWidgetID(widgetID);

    var scriptTags = doc.getElementsByTagName("script");
    for (var i = scriptTags.length - 1; i >= 0; i--)
    {
        var needsRewrite = false;
        var scriptTag = scriptTags.item(i);
        if (!scriptTag.src && scriptTag.type == "text/xml")
        {
            var widgets = OAWidgetManager.xmlToWidgetList(scriptTag.innerHTML.replace(/\s*<!(--|\[CDATA\[)\s*|\s*(--|\]\])>\s*/g, ""));
            if (widgets.length)
            {
                for (var j = widgets.length - 1; j >= 0; j--)
                {
                    var w = widgets[j];
                    if (w.exchangeID == exchangeID && w.binding == binding)
                    {
                        widgets.splice(j, 1);
                        needsRewrite = true;
                    }
                }
                if (needsRewrite)
                    OAWidgetManager.writeWidgetListToDocument(doc, widgets);
            }
        }
    }
};

OAWidgetManager.prototype.removeEntryFromDocumentWidgetList = OAWidgetManager.removeEntryFromDocumentWidgetList;

// getWidgetsUsedWithinDocument(doc)
//
// DESCRIPTION:
//
// Returns a dictionary of all widgets currently used in the specified document.
// The dictionary key is the OAM widget id hash, the value for each key is another
// dictionary object whose keys are the bindings used by each instance of that widget type.
//
// ARGUMENTS:
//
// doc - The document DOM element.
//
// RETURNS:
//
// Returns a dictionary object.

OAWidgetManager.getWidgetsUsedWithinDocument = function(doc)
{
    var results = new Object;
    var widgets = OAWidgetManager.getDocumentWidgetList(doc);
    for (var i = 0; i < widgets.length; i++)
    {
        var w = widgets[i];
        var info = results[w.exchangeID];
        if (!info)
            results[w.exchangeID] = info = new Object;
        info[w.binding] = w;
    }
    return results;
};

OAWidgetManager.prototype.getWidgetsUsedWithinDocument = OAWidgetManager.getWidgetsUsedWithinDocument;

// getAdobeCommonWidgetsDirectory()
//
// DESCRIPTION:
//
// Returns the absolute file path URL to the directory that the WidgetBrowser uses to save
// widget user presets and other widget related metadata/files that can be used by other applications.
// The default location for this directory on each platform is as follows:
//
//   WinXP:  file:///C:/Documents%20and%20Settings/<username>/Application%20Data/Adobe/Common/WebWidgets/
//   MacOSX: /Users/<username>/Library/Application Support/Adobe/Common/WebWidgets/
//
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// Returns the path as a string.

OAWidgetManager.getAdobeCommonWidgetsDirectory = function()
{
    var path = dw.relativeToAbsoluteURL(dw.getUserConfigurationPath() + "dw-non-existent-file.txt", "", "../../../WidgetBrowser/");
    return OAMetaData.makeStrEndWithSlash(path);
};

// getSharedWidgetPresetsDirectory()
//
// DESCRIPTION:
//
// Returns the path to the directory where the Widget Browser
// writes user presets to. This directory is shared by both
// the Widget Browser and Dreamweaver.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// Returns the path as a string.

OAWidgetManager.getSharedWidgetPresetsDirectory = function()
{
    return OAWidgetManager.getAdobeCommonWidgetsDirectory() + "Presets/";
};

// getWidgetsDirectory()
//
// DESCRIPTION:
//
// Returns the path to the directory in the Dreamweaver user config
/// directory that contains the installed widget assets.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// Returns the path as a string.

OAWidgetManager.getWidgetsDirectory = function()
{
    return OAWidgetManager.getAdobeCommonWidgetsDirectory() + "Widgets/";
};

OAWidgetManager.prototype.getWidgetsDirectory = OAWidgetManager.getWidgetsDirectory;

// getInstalledWidgetsXMLPath()
//
// DESCRIPTION:
//
// Returns the path to the Widgets.xml file which lists the
// widgets that are "installed" and "available" for Dreamweaver.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// Returns the path as a string.

OAWidgetManager.getInstalledWidgetsXMLPath = function()
{
    return OAWidgetManager.getWidgetsDirectory() + "Widgets.xml";
};

OAWidgetManager.prototype.getInstalledWidgetsXMLPath = OAWidgetManager.getInstalledWidgetsXMLPath;

// getWidgetConfigDirectory(widgetID)
//
// DESCRIPTION:
//
// Returns the path to the widget's assets within the DW configuration directory.
//
// ARGUMENTS:
//
// widgetID - The widget ID hash.
//
// RETURNS:
//
// Returns the path as a string.

OAWidgetManager.getWidgetConfigDirectory = function(widgetID)
{
    var widgets = OAWidgetManager.getInstalledWidgets();
    var w = widgets.widgetHash[widgetID];
    if (w)
        return OAWidgetManager.getWidgetsDirectory() + w.location;
    return "";
};

OAWidgetManager.prototype.getWidgetConfigDirectory = OAWidgetManager.getWidgetConfigDirectory;

// getWidgetConfigAssetsDirectory(widgetID)
//
// DESCRIPTION:
//
// Returns the path to the widget's assets within the DW configuration directory.
//
// ARGUMENTS:
//
// widgetID - The widget ID hash.
//
// RETURNS:
//
// Returns the path as a string.

OAWidgetManager.getWidgetConfigAssetsDirectory = function(widgetID)
{
    return OAWidgetManager.getWidgetConfigDirectory(widgetID) + "Assets/";
};

OAWidgetManager.prototype.getWidgetConfigAssetsDirectory = OAWidgetManager.getWidgetConfigAssetsDirectory;

// getWidgetOAMPath(widgetID)
//
// DESCRIPTION:
//
// Returns the path to the widget's OAM XML file within the DW configuration directory.
//
// ARGUMENTS:
//
// widgetID - The widget ID hash.
//
// RETURNS:
//
// Returns the path as a string.

OAWidgetManager.getWidgetOAMPath = function(widgetID)
{
    var configDir = OAWidgetManager.getWidgetConfigDirectory(widgetID);
    var configFile = configDir + "config.xml";
    if (DWfile.exists(configFile))
    {
        var dom = dw.getDocumentDOM(configFile);
        if (dom)
        {
            var ele = dom.getElementsByTagName("oamFile").item(0);
            if (ele)
            {
                var src = ele.getAttribute("src");
                if (src)
                    return configDir + src;
            }
        }
    }
    return "";
};

OAWidgetManager.prototype.getWidgetOAMPath = OAWidgetManager.getWidgetOAMPath;

// confirmExistenceOfWidgetOAMFile()
//
// DESCRIPTION:
//
// Loads the config.xml file in the specified directory and confirms
// the existence of an OAM file within the widget's Assets. Returns a
// boolean true if an OAM file does exist, and false if it does not.
//
// ARGUMENTS:
//
// widgetDir - String. The path to the widget directory.
//
// RETURNS:
//
// Returns boolean true or false.

OAWidgetManager.confirmExistenceOfWidgetOAMFile = function(widgetDir)
{
    var configXMLPath = widgetDir + "config.xml";

    if (DWfile.exists(configXMLPath))
    {
        var dom = dw.getDocumentDOM(configXMLPath);
        if (dom)
        {
            var ele = dom.getElementsByTagName("oamFile").item(0);
            if (ele)
            {
                var src = ele.getAttribute("src");
                if (src)
                {
                    var oamFile = widgetDir + src;
                    if (DWfile.exists(oamFile))
                    {
                        dom = dw.getDocumentDOM(oamFile);
                        if (dom)
                        {
                            ele = dom.getElementsByTagName("widget").item(0);
                            if (ele)
                                return true;
                        }
                    }
                }
            }
        }
    }
    return false;
};

OAWidgetManager.prototype.confirmExistenceOfWidgetOAMFile = OAWidgetManager.confirmExistenceOfWidgetOAMFile;

// getChildElementOrAttrValue(ele, childName)
//
// DESCRIPTION:
//
// Utility function that retrieves the value of the
// child element with the specified name. If no child
// exists, it checks for an attribute of the same name
// on the element itself.
//
// ARGUMENTS:
//
// ele - DOM element.
// childName - The element/attribute name that will contain the value.
//
// RETURNS:
//
// Returns String or undefined.

OAWidgetManager.getChildElementOrAttrValue = function(ele, childName)
{
    if (ele && childName)
    {
        // If the element has a child element with a nodeName that
        // matches the specified childName, return its text value.
        // If no matching child element exists, check to see if the
        // element has an attribute of the same name. If so, return
        // its value.

        var child = ele.getElementsByTagName(childName).item(0);
        if (child)
            return OAMetaData.getTextValueForElement(child);
        else
            return ele.getAttribute(childName);
    }
    return undefined;
};

// getApplicationCache()
//
// DESCRIPTION:
//
// Returns the global OAWidgetManager cache object that is shared
// across all documents loaded within Dreamweaver. This cache object
// contains the various caches used by the OAWidgetManager to limit
// the loading and parsing of the Widgets.xml and widget OAM XML files.
//
// ARGUMENTS:
//
// None.
//
// RETURNS:
//
// Returns an Object.

OAWidgetManager.getApplicationCache = function()
{
    var cache = {}; // Initialize to a dummy object in case MM is not available.

    if (MM)
    {
        if (!MM.OAWidgetManagerCache)
            MM.OAWidgetManagerCache = {};
        cache = MM.OAWidgetManagerCache;
    }

    // Array cache for widget data from Widgets.xml.

    if (!cache.widgetInfoCache)
        cache.widgetInfoCache = [];

    // Dictionary cache for OAM files that are loaded and parsed.

    if (!cache.oamCache)
        cache.oamCache = {};

    return cache;
};

// getInstalledWidgets(refreshCache)
//
// DESCRIPTION:
//
// Returns an array of objects that describe what OA Widgets are currently
// installed/available from the DW install and user config directories. If
// no widgets are installed/available, an empty array is returned.
//
// The results are always cached. If the user wants to insure that the
// results are fresh, he should pass a true for the refreshCache arg.
//
// ARGUMENTS:
//
// refreshCache - Boolean. If true reload all widgetInfo from disk, else return cached data if available.
//
// RETURNS:
//
// Returns an Array of Objects.

OAWidgetManager.getInstalledWidgets = function(refreshCache)
{
    var widgetsXML = OAWidgetManager.getInstalledWidgetsXMLPath();
    var widgetInfo = OAWidgetManager.getApplicationCache().widgetInfoCache;
    var widgetsXMLExists = DWfile.exists(widgetsXML);

    if (!refreshCache && widgetsXMLExists && widgetInfo.cacheTimeStamp)
    {
        // Make sure the cache isn't stale.
        if (OAWidgetManager.timeStampIsNewer(widgetsXML, widgetInfo.cacheTimeStamp))
            return widgetInfo;
    }

    widgetInfo.length = 0;
    widgetInfo.cacheTimeStamp = null;
    widgetInfo.widgetHash = {};
    widgetInfo.exchangeHash = {};

    var widgetsDir = OAWidgetManager.getWidgetsDirectory();

    if (widgetsXMLExists)
    {
        widgetInfo.cacheTimeStamp = new Date();
        var widgetsXMLDOM = dw.getDocumentDOM(widgetsXML);
        var widgets = widgetsXMLDOM.getElementsByTagName("widget");

        var gv = OAWidgetManager.getChildElementOrAttrValue;
        for (var i = 0; i < widgets.length; i++)
        {
            var w = widgets.item(i);
            var name = gv(w, "name");
            var exchangeID = gv(w, "widgetID");
            var version = gv(w, "version");
            var location = gv(w, "location");
            var presetsLocation = gv(w, "presetsXMLLocation");
            var enabled = gv(w, "enabled");
            var imported = gv(w, "imported");

            // XXX: Note that we are URI encoding the location here. This means that
            // if we ever attempt to use location within a native path, that it
            // needs to be decoded first. Note that we are using encodeURI() instead
            // of encodeURIComponent() because the location may actually contain
            // a path through multiple directories and we don't want the slashes
            // encoded.

            if (location)
                location = OAMetaData.makeStrEndWithSlash(encodeURI(location));

            if (name && exchangeID && version && location && OAWidgetManager.confirmExistenceOfWidgetOAMFile(widgetsDir + location))
            {
                var o = new Object;
                o.name = name;
                o.exchangeID = exchangeID;
                o.widgetID = exchangeID + "::" + version;
                o.version = version;
                o.location = location;
                o.presetsLocation = encodeURI(presetsLocation);
                o.enabled = (enabled && enabled != "false") ? true : false;
                o.imported = (imported && imported != "false") ? true : false;
                widgetInfo.push(o);

                // If the widget is enabled, add it to our caches. Note that
                // if there are duplicates, as there will be for widgets that
                // have the same exchangeID but different version, last one
                // defined in the Widgets.xml file will be returned by the cache.

                if (o.enabled)
                    widgetInfo.widgetHash[o.widgetID] = widgetInfo.exchangeHash[o.exchangeID] = o;
            }
        }
    }

    return widgetInfo;
};

OAWidgetManager.prototype.getInstalledWidgets = OAWidgetManager.getInstalledWidgets;


// getWidgetIDForExchangeID(exchangeID)
//
// DESCRIPTION:
//
// Returns the internal widgetID for the widget identified by the
// exchangeID.
//
// ARGUMENTS:
//
// exchangeID - The @wid attribute value for the widget in the Widgets.xml file.
//
// RETURNS:
//
// Returns a string that is the internal widgetID.

OAWidgetManager.getWidgetIDForExchangeID = function(exchangeID)
{
    var w = OAWidgetManager.getInstalledWidgets().exchangeHash[exchangeID];
    return w ? w.widgetID : "";
};

OAWidgetManager.prototype.getWidgetIDForExchangeID = OAWidgetManager.getWidgetIDForExchangeID;

// getExchangeIDForWidgetID(widgetID)
//
// DESCRIPTION:
//
// Returns the exchangeID for the widget identified by the
// widgetID reference.
//
// ARGUMENTS:
//
// widgetID - The widgetID reference.
//
// RETURNS:
//
// Returns a string that is the exchangeID.

OAWidgetManager.getExchangeIDForWidgetID = function(widgetID)
{
    // var w = OAWidgetManager.getInstalledWidgets().widgetHash[widgetID];
    // return w ? w.exchangeID : "";

    // [jblas 10/01/2009] Let's do the quick and dirty
    // solution that is much faster.
    return widgetID ? widgetID.split("::")[0] : "";
};

OAWidgetManager.prototype.getExchangeIDForWidgetID = OAWidgetManager.getExchangeIDForWidgetID;

// extractInfoFromPresetNodeList()
//
// DESCRIPTION:
//
// Returns an array of objects that contain the info for each preset
// described the list preset elements passed into the function.
//
// ARGUMENTS:
//
// presetNodeList - A DOM NodeList that contains <preset> DOM elements.
//
// RETURNS:
//
// Returns an Array of Objects.

OAWidgetManager.extractInfoFromPresetNodeList = function(presetNodeList)
{
    var results = new Array;
    for (var i = 0; i < presetNodeList.length; i++)
    {
        var pe = presetNodeList.item(i);
        var presetName = pe.getAttribute("name");
        if (!presetName)
            presetName = "Preset " + (i + 1);
        var props = new Object();
        var propEles = pe.getElementsByTagName("property");
        for (var j = 0; j < propEles.length; j++)
        {
            var propEle = propEles.item(j);
            var propName = propEle.getAttribute("name");
            props[propName] = propEle.getAttribute("value");
        }

        var preset = new Object;
        preset.name = presetName;
        preset.properties = props;
        preset.xmlString = pe.outerHTML;
        results.push(preset);
    }

    return results;
};

// getDefaultPresetsForWidget()
//
// DESCRIPTION:
//
// Returns an array of objects that describe the widget developer presets
// that actually ship with the widget package.
//
// ARGUMENTS:
//
// N/A
//
// RETURNS:
//
// Returns an Array of Objects.

OAWidgetManager.getDefaultPresetsForWidget = function(widgetID)
{
    var results = new Array();

    // Widgets always have a default preset.

    var defaultProp = { name: "<default>", properties: {}, xmlString: "<preset id='0' name='&lt;default&gt;'></preset>" };
    results.push(defaultProp);

    // Now find the presets.xml file, extract out any presets it may
    // contain, and add it to our results.

    var presetsFile = OAWidgetManager.getWidgetConfigDirectory(widgetID) + "config.xml";
    if (DWfile.exists(presetsFile))
    {
        var dom = dw.getDocumentDOM(presetsFile);
        if (dom)
        {
            var presets = OAWidgetManager.extractInfoFromPresetNodeList(dom.getElementsByTagName("preset"));
            if (presets.length > 0)
            {
                presets.unshift(results[0]);
                results = presets;
            }
        }
    }

    return results;
};

OAWidgetManager.prototype.getDefaultPresetsForWidget = OAWidgetManager.getDefaultPresetsForWidget;

// getUserPresetsForWidget()
//
// DESCRIPTION:
//
// Returns an array of objects that describe the user-defined presets
// for the specified widget.
//
// ARGUMENTS:
//
// widgetID - The widget reference ID.
//
// RETURNS:
//
// Returns an Array of Objects.

OAWidgetManager.getUserPresetsForWidget = function(widgetID)
{
    var results = [];
    var w = OAWidgetManager.getInstalledWidgets().widgetHash[widgetID];
    if (w && w.presetsLocation)
    {
        var presetsXMLPath = dw.relativeToAbsoluteURL(OAWidgetManager.getInstalledWidgetsXMLPath(), "", w.presetsLocation);
        if (presetsXMLPath && DWfile.exists(presetsXMLPath))
        {
            var dom = dw.getDocumentDOM(presetsXMLPath);
            if (dom)
                results = OAWidgetManager.extractInfoFromPresetNodeList(dom.getElementsByTagName("preset"));
        }
    }

    return results;
};

OAWidgetManager.prototype.getUserPresetsForWidget = OAWidgetManager.getUserPresetsForWidget;


// getWidgetHelpLink()
//
// DESCRIPTION:
//
// Returns an object that contains the label and link to use for displaying the widget's remote help documentation.
//
// ARGUMENTS:
//
// widgetID - String. The hex hash of the OAM widget ID.
// locale - String. Specifies the language and country that is currently being used.
//
// RETURNS:
//
// Returns an Object or null.

OAWidgetManager.prototype.getWidgetHelpLink = function(widgetID, locale)
{
    var results = null;
    var wmd = this.getWidgetMetaData(widgetID);

    if (wmd)
    {
        var help = wmd.help;
        if (help && help.label && help.src)
        {
            // XXX: Ideally we would want to see if the OAM file specified
            //      the labels for each locale.
            results = new Object;
            results.label = wmd.help.label;
            results.src = wmd.help.src;
        }

        // If the OAM has an aboutUri specified, use that
        // link as the help link.

        if ((!help || !help.src) && wmd.aboutURI)
        {
            results = new Object;
            results.src = wmd.aboutURI;
            results.label = "";
        }
    }
    return results;
};

// getIconForDisplay()
//
// DESCRIPTION:
//
// Searches through the icons described in the OAM file for the specified
// widgetID, and returns an object that describes the icon that best fits
// within the specified display width and height. If the OAM specifies
// no icons, this function returns null.
//
// ARGUMENTS:
//
// widgetID: String. The hex hash of the OAM widget ID.
// dispWidth: The width of the area the icon will be displayed in.
// dispHeight: The height of the area the icon will be displayed in.
//
// RETURNS:
//
// Returns an Object or null.

OAWidgetManager.prototype.getIconForDisplay = function(widgetID, dispWidth, dispHeight)
{
    var widgetIconKey = widgetID + ":" + dispWidth + "x" + dispHeight;
    var icon = this.iconCache[widgetIconKey];
    if (icon)
        return icon;

    // Pick the closest icon size.
    var wmd = this.getWidgetMetaData(widgetID);
    if (wmd)
    {
        var icons = wmd.getIcons();
        if (icons.length > 0)
        {
            // Choose the best icon that fits within dispWidth and dispHeight

            var minValue = 100000;
            var minIndex = -1;
            var scaleValue = 1;

            for (var i = 0; i < icons.length; i++)
            {
                var icon = icons[i];
                var r = Math.min(dispWidth / icon.width, dispHeight / icon.height);
                var v = Math.abs(1 - r);
                if (minValue >= v)
                {
                    minIndex = i;
                    scaleValue = r;
                }
            }

            // If we have a matching icon, return its info.

            if (minIndex != -1)
            {
                var icon = icons[minIndex];
                var o = new Object;
                o.src = icon.src;
                o.width = Math.floor(icon.width * scaleValue);
                o.height = Math.floor(icon.height * scaleValue);
                this.iconCache[widgetIconKey] = o;
                return o;
            }
        }
    }
    return null;
};

// getUniqueElementID(baseID)
//
// DESCRIPTION:
//
// Looks up the specified baseID within the document. If that
// id is not used by an element within the document, and is not already
// in the id cache, then the baseID is determined to be unique and returned
// to the caller. If the baseID is already used or within the cache, the
// function appends an integer to the baseID until a unique id is obtained.
//
// ARGUMENTS:
//
// baseID - The ID to lookup within the specified document.
//
// RETURNS:
//
// Returns String that is a unique id derived from baseID.

OAWidgetManager.prototype.getUniqueElementID = function(baseID)
{
    if (!this.doc || !baseID)
        return baseID;

    var uid = baseID;
    var i = 0;
    var done = false;

    do
    {
        if (++i > 1)
            uid = baseID + "_" + i;
        var ele = this.doc.getElementById(uid);
        if (!ele && !this.idCache[uid])
            this.idCache[uid] = done = true;
    } while (!done);

    return uid;
}

// timeStampIsNewer(filePath, timeStamp)
//
// DESCRIPTION:
//
// Returns true if the specified timeStamp is newer than the
// creation and modification date of the file specified by the
// filePath.
//
// ARGUMENTS:
//
// filePath - String. The absolute file path to a file on disk.
// timeStamp - JS Date object.
//
// RETURNS:
//
// Returns an OAMetaData object.

OAWidgetManager.timeStampIsNewer = function(filePath, timeStamp)
{
    // NOTE: We need to check against both Creation and Modification
    //       dates because the Windows OS preserves the modification date
    //       for a given file when it is copied, so the creation date can
    //       be newer than the modification date on the file.

    return DWfile.getCreationDateObj(filePath) < timeStamp && DWfile.getModificationDateObj(filePath) < timeStamp;
};

// getWidgetMetaData(widgetID)
//
// DESCRIPTION:
//
// Retrieves the OAMetaData object associated with the specified widget id.
// If no OAMetaData object exists, it loads and parses the OAM XML file for
// the widget and creates an OAMetaData object.
//
// ARGUMENTS:
//
// widgetID - The hex string identifier for a given widget.
//
// RETURNS:
//
// Returns an OAMetaData object.

OAWidgetManager.prototype.getWidgetMetaData = function(widgetID)
{
    var wmd = null;
    var oamPath = OAWidgetManager.getWidgetOAMPath(widgetID);
    var oamCache = OAWidgetManager.getApplicationCache().oamCache;

    if (oamPath && DWfile.exists(oamPath))
    {
        wmd = oamCache[widgetID];
        if (wmd)
        {
            if (OAWidgetManager.timeStampIsNewer(oamPath, wmd.oamCacheTimeStamp))
                return wmd;

            // Cached copy is stale.

            wmd = null;
        }

        oamCache[widgetID] = undefined;

        var dom = dw.getDocumentDOM(oamPath);
        if (dom)
        {
            wmd = OAMetaData.parse(widgetID, dom, oamPath);
            if (wmd)
            {
                wmd.oamCacheTimeStamp = new Date();
                oamCache[widgetID] = wmd;
            }
        }
    }
    return wmd;
};

// addWidgetAssetsToDependentDictionary(widgetID)
//
// DESCRIPTION:
//
// Adds the assets for the specified widget to the widget manager's
// asset reference cache. This cache tracks what widgets use a specific
// asset.
//
// ARGUMENTS:
//
// widgetID - The hex string identifier for a given widget.
//
// RETURNS:
//
// Returns an array of asset objects.

OAWidgetManager.prototype.addWidgetAssetsToDependentDictionary = function(widgetID)
{
    var results = [];
    var wmd = this.getWidgetMetaData(widgetID);
    if (wmd)
    {
        var exchangeID = this.getExchangeIDForWidgetID(widgetID);
        var assets = wmd.getAssets();
        var dict = this.assetDependentDict;

        for (var i = 0; i < assets.length; i++)
        {
            var asset = assets[i];
            var path = asset.destURL;

            if (path && (asset.refType == "javascript" || asset.refType == "link"))
            {
                var pathRef = dict[path];
                if (!pathRef)
                {
                    dict[path] = pathRef = new Object;
                    pathRef.path = path;
                    pathRef.refType = asset.refType;
                    pathRef.widgetIDs = new Object;
                }
                pathRef.widgetIDs[exchangeID] = true;

                results.push(pathRef);
            }
        }
    }
    return results;
};

// getWidgetAssetDependentsDictionary(widgetID)
//
// DESCRIPTION:
//
// Returns an array of objects that describe the
// assets for a specific widget. Each object in the
// array also allows the caller to figure out if a particular
// asset is used by other widgets.
//
// ARGUMENTS:
//
// widgetID - The hex string identifier for a given widget.
//
// RETURNS:
//
// Returns an array of asset objects.

OAWidgetManager.prototype.getWidgetAssetDependentsDictionary = function(widgetID)
{
    var pathRefs = new Array();
    var wmd = this.getWidgetMetaData(widgetID);
    if (wmd)
    {
        var assets = wmd.getAssets();
        var dict = this.assetDependentDict;

        for (var i = 0; i < assets.length; i++)
        {
            var asset = assets[i];
            var path = asset.destURL;
            if (path && (asset.refType == "javascript" || asset.refType == "link"))
                pathRefs.push(dict[path]);
        }
    }
    return pathRefs;
};

// createWidget(doc, exchangeID, binding)
//
// DESCRIPTION:
//
// Creates an OAWidget object and adds it to the widget manager's
// widget cache.
//
// ARGUMENTS:
//
// doc - The DOM document that contains the markup for the widget.
// exchangeID - The value of the @widgetID attribute used in the Widgets.xml file.
// binding - The data that binds the widget with the markup. (selector, id, etc)
//
// RETURNS:
//
// Returns an OAWidget object.

OAWidgetManager.prototype.createWidgetInstance = function(doc, exchangeID, binding)
{
    var w = new OAWidgetInstance(doc, exchangeID, binding);
    var widgetCache = this.widgetCache[exchangeID];
    if (!widgetCache)
        widgetCache = this.widgetCache[exchangeID] = new Object;
    widgetCache[binding] = w;
    return w;
};

// removeWidgetInstance(exchangeID, binding)
//
// DESCRIPTION:
//
// Finds the OAWidget object, associated with the exchangeID and
// binding, in the cache and removes it.
//
// ARGUMENTS:
//
// exchangeID - The hashed hex string identifier for the widget.
// binding - The data that binds the widget with the markup. (selector, id, etc)
//
// RETURNS:
//
// Returns the OAWidget object that was removed. If there was no
// object, returns undefined.

OAWidgetManager.prototype.removeWidgetInstance = function(exchangeID, binding)
{
    var widgetCache = this.widgetCache[exchangeID];
    var w = widgetCache[binding];
    if (w)
        widgetCache[binding] = undefined;
    return w;
};

// getWidgetInstance(exchangeID, binding)
//
// DESCRIPTION:
//
// Returns the OAWidget object associated with the specified exchangeID and binding
// from the widget manager's widget cache. Returns null if one doesn't exist in the
// cache.
//
// ARGUMENTS:
//
// exchangeID - The hashed hex string identifier for the widget.
// binding - The data that binds the widget with the markup. (selector, id, etc)
//
// RETURNS:
//
// Returns an OAWidget object.

OAWidgetManager.prototype.getWidgetInstance = function(exchangeID, binding)
{
    var w = null;
    var widgetCache = this.widgetCache[exchangeID];
    if (widgetCache)
        w = widgetCache[binding];
    return w;
};

// createWidgetMarkup(widgetID, propValues)
//
// DESCRIPTION:
//
// Generates the list of dependent assets and markup for the specified widget
// based on the property values passed in. The default values will be used
// for any properties not specified.
//
// ARGUMENTS:
//
// widgetID - The hashed hex string identifier for the widget.
// propValues - Associative array of property names (key) and values *OR* a string of XML that uses <property name="" value=""> tags.
//
// RETURNS:
//
// Returns Object.

OAWidgetManager.prototype.createWidgetMarkup = function(widgetID, propValues)
{
    var wmd = this.getWidgetMetaData(widgetID);
    if (!wmd)
        return null;

    // If the caller passed us a property XML string, convert
    // into a an associative array so it can be merged with
    // the default property values from the widget's OAM file.

    if (typeof propValues == "string")
    {
        var propXML = propValues;
        propValues = {};
        var dom = dw.getNewDocumentDOM();
        dom.documentElement.outerHTML = propXML;
        var propEles = dom.getElementsByTagName("property");
        for (var i = 0; i < propEles.length; i++)
        {
            var ele = propEles.item(i);
            var name = ele.getAttribute("name");
            if (name)
            {
                var value = ele.getAttribute("value");
                if (value != undefined)
                    propValues[name] = value;
            }
        }
    }

    // Grab all the default property values defined within the
    // OAM file and add them to the mergedPropValues hash. Make
    // sure to note the properties that are meant to be element ids.

    var hasOutputDefault = {};
    var outputFormatProps = {};
    var mergedPropValues = {};
    var defaultProps = wmd.getProperties();
    var defaultPropsHash = {};
    var idProps = {};
    for (var i = 0; i < defaultProps.length; i++)
    {
        var p = defaultProps[i];
        if (p.dataType == "string" && p.format == "id")
            idProps[p.name] = true;
        mergedPropValues[p.name] = p.defaultValue;

        // If the property has an output format specified,
        // push it into a special list so that we can do
        // some value pre-processing later.

        if (p.outputFormat != undefined)
            outputFormatProps[p.name] = p;
        if (p.outputDefault != undefined)
            hasOutputDefault[p.name] = true;

        defaultPropsHash[p.name] = p;
    }

    // Override the default property values with the ones passed into
    // this function.

    for (var pName in propValues)
        mergedPropValues[pName] = propValues[pName];

    var propsUsed = wmd.getPropertiesUsedHash();
    if (propsUsed["__WID__"] && (typeof mergedPropValues["__WID__"] == "undefined"))
    {
        idProps["__WID__"] = true;
        mergedPropValues["__WID__"] = wmd.widPrefix;
    }

    // Go back through the merged set of properties and make sure
    // all id property values are unique.

    for (var pName in idProps)
        mergedPropValues[pName] = this.getUniqueElementID(mergedPropValues[pName]);

    // Now that we've merged the set of properties, we need to run
    // through the results and look for properties that are using their
    // default values and have an output default.

    for (var pName in hasOutputDefault)
    {
        var p = defaultPropsHash[pName];
        if (p.defaultValue == mergedPropValues[pName])
        {
            mergedPropValues[pName] = OAMetaData.Property.applyOutputFormat(p.dataType, p.format, mergedPropValues[pName], p.outputDefault);

            // Make sure this property is not in the outputFormatProps
            // hash so it doesn't get processed twice.

            if (outputFormatProps[pName])
                delete outputFormatProps[pName];
        }
    }

    // If there are properties that have output formats specified, apply
    // the formatting to the value.

    for (var pName in outputFormatProps)
    {
        var p = outputFormatProps[pName];
        mergedPropValues[pName] = OAMetaData.Property.applyOutputFormat(p.dataType, p.format, mergedPropValues[pName], p.outputFormat);
    }

    this.idCache = new Object();

    // Now generate the widget markup using our merged set of property values.

    return wmd.createWidgetMarkup(mergedPropValues);
};

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

OAWidgetManager.getElementsPreOrder = function(node, arr)
{
    if (!arr)
        arr = [];
    if (node && node.nodeType == 1)
    {
        arr.push(node);
        var c = node.firstChild;
        while (c)
        {
            OAWidgetManager.getElementsPreOrder(c, arr);
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

OAWidgetManager.slowGetElementsByTagName = function(container, tagName, caseSensitiveLookup)
{
    // We want this function to mimic what the real getElementsByTagName()
    // returns, so we build a return object with the same API.

    var nodeList = new Object;
    nodeList._arr = new Array();
    nodeList.length = 0;
    nodeList.item = function(i) { return nodeList._arr[i]; }

    var tagName = caseSensitiveLookup ? tagName.toLowerCase() : tagName;
    var eleArr = OAWidgetManager.getElementsPreOrder(container);

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

// DocInfo(doc)
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

OAWidgetManager.DocInfo = function(doc)
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
            this.headEditRgns = OAWidgetManager.slowGetElementsByTagName(this.head, "MMTINSTANCE:EDITABLE", true);
        if (this.body)
            this.bodyEditRgns = OAWidgetManager.slowGetElementsByTagName(this.body, "MMTINSTANCE:EDITABLE", true);
    }
}

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

OAWidgetManager.DocInfo.prototype.headIsEditable = function()
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

OAWidgetManager.DocInfo.prototype.bodyIsEditable = function()
{
    if (this.body)
    {
        if (this.isTemplateInstance)
            return (this.bodyEditRgns && this.bodyEditRgns.length > 0);
        return true;
    }
    return false;
}

// OAMetaData(doc)
//
// DESCRIPTION:
//
// The constructor for an object that can be used to extract information from
// a widget OAM XML file. Developers do not instantiate an OAMetaData object directly.
// Instead, they call OAMetaData.parse() for a given OAM XML file, and it will return
// an OAMetaData object that represents the information within the OAM XML file.
//
// ARGUMENTS:
//
// widgetID - The widget reference ID.
// doc - The document DOM element for a widget OAM XML file.
// oamPath - The path to the OAM file to parse.
//
// RETURNS:
//
// N/A

function OAMetaData(widgetID, doc, oamPath)
{
    this.doc = doc;         // The oam xml dom representation.
    this.oamPath = oamPath; // The path to the OAM file.
    this.id = "";           // The widget @id value.
    this.widgetID = widgetID;  // The widget reference ID.
    this.version = "";      // The widget @version attribute.
    this.name = "";         // The widget @name attribute.
    this.aboutURI = "";     // The widget @aboutUri value.
    this.libraries = [];    // The <library> information.
    this.librariesHash = [];// The <library> information indexed by src.
    this.requires = [];     // The <require> information.
    this.props = [];        // The properties parsed out of the oam. Declared order preserved.
    this.propsHash = {};    // A hash that allows you to fetch a property by name.
    this.css = [];          // The CSS content embedded within the oam.
    this.javascript = [];   // The script content embedded within the oam.
    this.content = [];      // The markup content embedded within the oam.
    this.icons = [];        // The <icon> information.
    this.help = {};         // The <dw:help> information.

    this.propsUsed = {};   // The properties actually used within one or more of the templates in the oam.

    // The prefix for all __WID__ values generated. Can be overridden with the
    // dw:widPrefix attribute on the <widget> tag.

    this.widPrefix = "OAWidget";

    // How are the behaviors of the widget attached? The bindingMethod is one of the following:
    //
    //     id:          markup + constructor tied together via an id value.
    //     selector:    markup + constructor tied together via a CSS selector.
    //     unobtrusive: markup + include file that uses a known CSS selector.

    this.bindingMethod = "selector";

    // The bindingTemplate is the id or selector that gets used to bind the behavior to the
    // markup of the widget. The value of the bindingTemplate is templatized, so it can contain
    // property references.

    this.bindingTemplate = "#__WID__";
    this.bindingTemplateTokens = OAMetaData.parseOAMTemplate(this.bindingTemplate, this.propsUsed);
}

// getAssets()
//
// DESCRIPTION:
//
// Returns an array of objects that describe the assets (JS, CSS, image, etc) that
// are required for a functioning widget.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// N/A

OAMetaData.prototype.getAssets = function()
{
    var assets = new Array();
    var reqs = this.getRequires();
    var configAssetsDir = OAWidgetManager.getWidgetConfigAssetsDirectory(this.widgetID);

    for (var i = 0; i < reqs.length; i++)
    {
        var r = reqs[i];

        // We are only concerned with require objects with a src. That is, we
        // ignore any inline requires in the list.

        if (r.src)
        {
            var o = new Object;

            // If the require src is non-remote, prepend the configuration assets directory.

            o.srcURL = (OAMetaData.pathIsRemote(r.src) ? "" : configAssetsDir) + r.src;

            // If we have a remote target path, set the destURL blank so nothing gets copied.

            o.destURL = (r.target && !OAMetaData.pathIsRemote(r.target)) ? r.target : "";

            // We set the refType to "other" for any file type if the require's includeRef
            // attribute is false. This prevents the copyAssets() code from attempting to
            // insert a <script> or <link> reference.

            o.refType = !r.includeRef ? "other" : ((r.type == "css") ? "link" : r.type);
            
            o.useDefaultFolder = false; // XXX: What controls this in the OAM file?
            o.documentRelative = (r.relative == "document" ? true : false); // if attribute relative="document" is specified then copy document relative, otherwise site relative
                        
            assets.push(o);
        }
    }

    return assets;
};

// getRequires()
//
// DESCRIPTION:
//
// Returns an array of objects that contain the raw values for the attributes
// on all <require> tags within the OAM file.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// An object.

OAMetaData.prototype.getRequires = function()
{
    return this.requires;
};

// getProperties()
//
// DESCRIPTION:
//
// Returns an array of objects that contain the raw values for the attributes
// on all <property> tags within the OAM file.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// An OAMetaData.Property object.

OAMetaData.prototype.getProperties = function()
{
    return this.props;
};

// getPropertiesHash()
//
// DESCRIPTION:
//
// Returns an associative array of objects that contain the raw values for the attributes
// on all <property> tags within the OAM file. Developers can use this array to do property
// lookups by property name.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// An OAMetaData.Property object.

OAMetaData.prototype.getPropertiesHash = function()
{
    var hash = new Object();
    for (var i = 0; i < this.props.length; i++)
    {
        var p = this.props[i];
        hash[p.name] = p;
    }
    return hash;
};

// getPropertiesUsedHash()
//
// DESCRIPTION:
//
// Returns an associative array that provides the caller with a
// quick way to check if a particular property is used by any
// of the templates within the oam file.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// An associative array.

OAMetaData.prototype.getPropertiesUsedHash = function()
{
    var hash = new Object();
    for (var propName in this.propsUsed)
        hash[propName] = true;
    return hash;
};

// getContent()
//
// DESCRIPTION:
//
// Returns an array of objects that contain the raw content and values for the attributes
// on all <content> tags within the OAM file.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// An array of objects.

OAMetaData.prototype.getContent = function()
{
    return this.content;
};

// getJavaScript()
//
// DESCRIPTION:
//
// Returns an array of objects that contain the raw content and values for the attributes
// on all <javascript> tags within the OAM file.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// An array of objects.

OAMetaData.prototype.getJavaScript = function()
{
    return this.javascript;
};

// getCSS()
//
// DESCRIPTION:
//
// Returns an array of objects that contain the raw content and values for the attributes
// on all <dw:css> tags within the OAM file.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// An array of objects.

OAMetaData.prototype.getCSS = function()
{
    return this.css;
};

// getIcons()
//
// DESCRIPTION:
//
// Returns an array of objects that contain the information for all <icon>
// tags in the OAM file.
//
// ARGUMENTS:
//
// None
//
// RETURNS:
//
// An array of objects.

OAMetaData.prototype.getIcons = function()
{
    return this.icons;
};

// createWidgetMarkup()
//
// DESCRIPTION:
//
// Returns an object that contains the asset references and processed
// widget <content> and <javascript> markup.
//
// ARGUMENTS:
//
// propValues - Optional associative array of property names (key) and values.
//
// RETURNS:
//
// An Object.

OAMetaData.prototype.createWidgetMarkup = function(propValues)
{
    var wm = new Object;
    wm.requires = this.getRequires();
    wm.assetInfo = this.getAssets();
    wm.headMarkup = "";
    wm.widgetMarkup = "";
    wm.bodyEndMarkup = "";
    wm.bindingValue = this.processTemplate(this.bindingTemplateTokens, propValues);

    var headMarkup = [];
    var beforeMarkup = [];
    var afterMarkup = [];
    var atEnd = [];
    var content = [];

    // Process all of the <content> templates.

    var templates = this.getContent();
    for (var i = 0; i < templates.length; i++)
        content.push(this.processTemplate(templates[i].tokens, propValues));

    var exchangeID = OAWidgetManager.getExchangeIDForWidgetID(this.widgetID);
    
    var beginDelimiterText = "BeginOAWidget_Instance_" + exchangeID + ": " + wm.bindingValue;
    var endDelimiterText = "EndOAWidget_Instance_" + exchangeID;
    var beginScript = "<script type=\"text/javascript\">\n// " + beginDelimiterText;
    var endScript = "\n// " + endDelimiterText + "\n</script>\n";

    // Now process all of the <javascript> templates. Note we want to sort
    // all of the <javascript> content

    var templates = this.getJavaScript();
    for (var i = 0; i < templates.length; i++)
    {
        var t = templates[i];
        var str = "\n" + this.processTemplate(t.tokens, propValues);
        switch (t.location)
        {
            case "atEnd":
                atEnd.push(str);
                break;
            case "beforeContent":
                beforeMarkup.push(str);
                break;
            case "afterContent":
            default:
                afterMarkup.push(str);
                break;
        }
    }

    // Process all of the <dw:css> templates.

    var templates = this.getCSS();
    for (var i = 0; i < templates.length; i++)
        headMarkup.push(this.processTemplate(templates[i].tokens, propValues));
    if (headMarkup.length > 0)
    {
        headMarkup.unshift("<style type=\"text/css\">\n/* " + beginDelimiterText + " */\n");
        headMarkup.push("\n/* " + endDelimiterText + " */\n</style>\n");
    }

    if (beforeMarkup.length)
    {
        beforeMarkup.unshift(beginScript);
        beforeMarkup.push(endScript);
    }

    if (afterMarkup.length)
    {
        afterMarkup.unshift(beginScript);
        afterMarkup.push(endScript);
    }

    // XXX: Don't wrap with <script></script> since it will be handled for
    // us by the dom.addJavaScript() call that maintains the last <script> block
    // in the document.

    if (atEnd.length)
    {
        atEnd.unshift("\n// " + beginDelimiterText + "\n");
        atEnd.push("\n// " + endDelimiterText + "\n");
    }

    content = beforeMarkup.concat(content);
    content = content.concat(afterMarkup);

    wm.headMarkup = headMarkup.join("");
    wm.widgetMarkup = content.join("");
    wm.bodyEndMarkup = atEnd.join("");

    return wm;
};

OAMetaData.prototype.processTemplate = function(templateTokens, propValues)
{
    // Get the default property values defined within the OAM file.

    var defaultProps = this.getProperties();
    var propHash = {};
    for (var i = 0; i < defaultProps.length; i++)
    {
        var dp = defaultProps[i];
        propHash[dp.name] = dp.defaultValue;
    }

    // Override the default values with any the caller passed in.

    if (propValues)
    {
        for (var pName in propValues)
            propHash[pName] = propValues[pName];
    }

    // Replace all property references with real values.

    var results = [];

    for (var i = 0; i < templateTokens.length; i++)
    {
        var t = templateTokens[i];
        if (t == OAMetaData.Token.TKN_TEXT)
            results.push(t.value);
        else // OAMetaData.Token.TKN_DATA_REF
        {
            var filter = t.filterName ? OAMetaData.Property.filters[t.filterName] : null;
            var val = propHash[t.name];
            if (val == undefined)
                val = t.value;
            results.push(filter ? filter(val) : val);
        }
    }

    // Turn the results into a string.

    return results.join("");
};

// getParentsByTagName()
//
// DESCRIPTION:
//
// Returns an array of ancestor elements, that match a particular tag name,
// for the specified element. The elements are ordered closest to farthest
// within the array.
//
// ARGUMENTS:
//
// ele - The element who's ancestors you want to retrieve.
// tagName - The tag name that ancestors must match to be included in the results. Developers can use "*" if they wish to retrieve all ancestors.
//
// RETURNS:
//
// An array of DOM elements.

OAMetaData.getParentsByTagName = function(ele, tagName)
{
    var results = new Array();

    if (ele && tagName)
    {
        tagName = tagName.toLowerCase();
        var p = ele.parentNode;
        while (p)
        {
            if (p.nodeName.toLowerCase() == tagName || tagName == "*")
                results.push(p);
            p = p.parentNode;
        }
    }
    return results;
};

// makeStrEndWithSlash()
//
// DESCRIPTION:
//
// Returns a version of the specified string, that ends with a slash. If the string
// is empty or already ends with a slash, it simply returns the string.
//
// ARGUMENTS:
//
// str - The string to operate on.
//
// RETURNS:
//
// String

OAMetaData.makeStrEndWithSlash = function(str)
{
    return (!str || str.charAt(str.length - 1) == "/") ? str : str + "/";
};

// getFolderContentAsRequires()
//
// DESCRIPTION:
//
// Given a folder path within the specified widget's Asset configuration directory,
// create a <require> object for each file it contains.
//
// ARGUMENTS:
//
// oam - An instance of an OAMetaData object. All <require> objects that are generated will be added to its list of requires.
// assetRelativeFolderPath - A path to a directory that is under the widget's Asset configuration directory. This path is relative to the Asset directory.
// targetFolderPath - This is the target path that should be used when copying a file to the user's site.
//
// RETURNS:
//
// N/A

OAMetaData.getFolderContentAsRequires = function(requiresArr, widgetID, assetRelativeFolderPath, targetFolderPath, hashOfFilesToSkip)
{
    if (!hashOfFilesToSkip)
        hashOfFilesToSkip = {};

    assetRelativeFolderPath = OAMetaData.makeStrEndWithSlash(assetRelativeFolderPath);
    targetFolderPath = OAMetaData.makeStrEndWithSlash(targetFolderPath);

    var folderPath = OAWidgetManager.getWidgetConfigAssetsDirectory(widgetID) + assetRelativeFolderPath;

    var filesArr = DWfile.listFolder(folderPath, "files");
    var dirsArr = DWfile.listFolder(folderPath, "directories");

    for (var i = 0; i < filesArr.length; i++)
    {
        var f = filesArr[i];
        var srcPath = assetRelativeFolderPath + f;
        if (!hashOfFilesToSkip[srcPath])
        {
            var o = new OAMetaData.Require();
            o.src = srcPath;
            o.target = targetFolderPath + f;
            requiresArr.push(o);
        }
    }

    for (var i = 0; i < dirsArr.length; i++)
    {
        var d = dirsArr[i];
        OAMetaData.getFolderContentAsRequires(requiresArr, widgetID, assetRelativeFolderPath + d + "/", targetFolderPath + d + "/", hashOfFilesToSkip);
    }
};

// Require()
//
// DESCRIPTION:
//
// The constructor for an object that contains the src, target, and inline content for a <require>
// or <library> tag.
//
// ARGUMENTS:
//
// None.
//
// RETURNS:
//
// N/A

OAMetaData.Require = function() 
{
  this.type = "other";
  this.src = "";
  this.target = "";
  this.copy = true;
  this.includeRef = false;
  this.inlineContent = "";
  this.relative = "site";     // default to copying asset files site relative
};

// Require.initFromElement()
//
// DESCRIPTION:
//
// Set the internal state of a Require object to match the attribute values of a
// specific <require> or <library> element.
//
// ARGUMENTS:
//
// ele - A <require> or <library> DOM element node.
// absAssetsPath - The absolute path to the widget's Assets directory.
// absLocationPath - The absolute path to a document or directory for which the @src path, of the
//                   <require> or <library> element, is relative to.
// assetsRelativeTargetPathPrefix - Optional relative directory path to prepend to the target path of the <require> or <library>.
//
// RETURNS:
//
// N/A

OAMetaData.Require.prototype.initFromElement = function(ele, absAssetsPath, absLocationPath, assetsRelativeTargetPathPrefix) 
{
  if (!ele)
    return;

  this.src = ele.getAttribute("src");               // required, but optional for javascript and css
  this.type = ele.getAttribute("type");             // required
  this.target = ele.getAttribute("target");         // optional
  this.copy = ele.getAttribute("copy");             // optional, default is true
  this.includeRef = ele.getAttribute("includeRef"); // optional, default is true for js and css
  this.relative = ele.getAttribute("dw:relativeTo"); // optional, relative is "document" for copying file relative to the document, otherwise defaults to copying the file site relative
  
  this.inlineContent = "";

  this.copy = (!this.copy || this.copy != "false") ? true : false;

  if (this.includeRef == "true" || this.includeRef == "false")
    this.includeRef = this.includeRef == "true" ? true : false;
  else
    this.includeRef = (this.type == "javascript" || this.type == "css") ? true : false;

  // If no @src attribute is defined for javascript or css <require>
  // tags, it must have inline content.

  if (!this.src && (this.type == "javascript" || this.type == "css" || this.type == "markup"))
    this.inlineContent = OAMetaData.getTextValueForElement(ele);


  var isRemoteURL = false;

  if (this.src) 
  {
    isRemoteURL = OAMetaData.pathIsRemote(this.src);

    // If the src path isn't an http[s] URL, it is a path that is relative
    // to the absLocationPath. We need to turn it into an absolute path so we can
    // accurately calculate directory ancestor names, then strip off the
    // start of the path up to, and including the Assets directory.

    if (!isRemoteURL) 
    {
      // dw.relativeToAbsoluteURL() expects a document path. This is normally
      // not a problem since absLocationPath is typically the path to the OAM
      // XML file, but it can be a directory if we are processing a <require>
      // in a <library>. If it is a directory path, append a bogus filename to
      // it so that it calculates the absolute src path properly.

      if (absLocationPath.charAt(absLocationPath.length - 1) == "/")
        absLocationPath += "dw-non-existent-file.txt";
      absLocationDir = absLocationPath.replace(/[^\/]*$/, "");

      // Convert the @src path to an absolute path.

      var src = dw.relativeToAbsoluteURL(absLocationPath, "", this.src);

      // The src path of our object should be relative to the Assets directory.

      if (src)
        this.src = src.replace(absAssetsPath, "");

      if (assetsRelativeTargetPathPrefix)
        this.target = assetsRelativeTargetPathPrefix + (this.target ? this.target : src.replace(absLocationDir, ""));
    }

    // If we get here and the target is not yet specified, then we
    // either have an http[s] URL, or we have a <require> that is *NOT*
    // inside a <library> tag, and its @target attribute is not specified.
    // In either case, we simply set the target to the resolved src path.

    if (!this.target)
      this.target = this.src;
  }
};

// pathIsRemote()
//
// DESCRIPTION:
//
// Returns a boolean true if the specified path is an http or https URL.
//
// ARGUMENTS:
//
// path - String that is the path to check.
//
// RETURNS:
//
// Boolean

OAMetaData.pathIsRemote = function(path)
{
    return path && (path.search(/^https?:\/\//) != -1);
};

// getLibraryRequiredFiles()
//
// DESCRIPTION:
//
// Creates a Require object for any files referenced by the specified
// <library> element, and adds them to the results array that is passed
// into the function.
//
// ARGUMENTS:
//
// libEle - <library> DOM element.
// widgetID - The widget reference ID.
// absAssetsPath - The absolute path to the widget's Assets directory.
// absOAMPath - The absolute path to the widget's OAM file.
// results - The array that recieves the Require objects created by this function.
//
// RETURNS:
//
// N/A

OAMetaData.getLibraryRequiredFiles = function(libEle, widgetID, absAssetsPath, absOAMPath, results)
{
    var src = libEle.getAttribute("src");               // required
    if (!src)
        return results;

    var target = libEle.getAttribute("target");         // optional
    var type = libEle.getAttribute("type");             // optional
    var copy = libEle.getAttribute("copy");             // optional

    var isRemotePath = OAMetaData.pathIsRemote(src);

    if (type == undefined)
        type = "folder";

    copy = (!copy || copy != "false") ? true : false;

    if (type == "folder")
    {
        var absResolvedPath = src;

        if (!isRemotePath)
        {
            absResolvedPath = dw.relativeToAbsoluteURL(absOAMPath, "", src);
            if (absResolvedPath)
            {
                absResolvedPath = OAMetaData.makeStrEndWithSlash(absResolvedPath);
                src = absResolvedPath.replace(absAssetsPath, "");
            }
        }

        src = OAMetaData.makeStrEndWithSlash(src);

        // If a target wasn't specified, default to using the resolved src path,
        // otherwise, use the specified target value, but make sure it ends with a slash.

        target = (target == undefined) ? src : OAMetaData.makeStrEndWithSlash(target);

        var hashOfFilesToSkip = {};

        var reqs = libEle.getElementsByTagName("require");
        var libResults = [];
        for (var i = 0; i < reqs.length; i++)
        {
            var o = new OAMetaData.Require();
            o.initFromElement(reqs.item(i), absAssetsPath, absResolvedPath, target);
            results.push(o);
            if (o.copy)
                hashOfFilesToSkip[o.src];
        }

        if (copy && !isRemotePath)
            OAMetaData.getFolderContentAsRequires(results, widgetID, src, target, hashOfFilesToSkip);
    }
    else
    {
        var o = new OAMetaData.Require();
        o.initFromElement(libEle, absAssetsPath, absOAMPath);
        results.push(o);
    }
};

// getRequiredFiles()
//
// DESCRIPTION:
//
// Returns an array of Require objects for any files referenced by
// any <require> or <library> elements within the specified container element.
//
// ARGUMENTS:
//
// containerEle - A <require> or non-folder <library> DOM element.
// widgetID - The widget reference ID.
// absAssetsPath - The absolute path to the widget's Assets directory.
// absOAMPath - The absolute path to the widget's OAM file.
//
// RETURNS:
//
// Array - A list of Require objects.

OAMetaData.getRequiredFiles = function(containerEle, widgetID, absAssetsPath, absOAMPath)
{
    var results = new Array();

    // We have to manually run through the children of the container element
    // because we have to preserve the document order of all <require> and <library>
    // elements since it determines the order of the include references and inline
    // markup/code that gets inserted into the user's document.

    var c = containerEle.firstChild;
    var parentStack = [];

    while (c)
    {
        if (c.nodeType == 1) // Node.ELEMENT_NODE
        {
            var nodeName = c.nodeName.toLowerCase();
            switch (nodeName)
            {
                case "require":
                    var o = new OAMetaData.Require();
                    o.initFromElement(c, absAssetsPath, absOAMPath);
                    if (o.src || o.inlineContent)
                    {
                        if (o.type == "folder")
                        {
                            if (o.copy)
                                OAMetaData.getFolderContentAsRequires(results, widgetID, o.src, o.target);
                        }
                        else
                            results.push(o);
                    }
                    break;
                case "requires":
                    if (c.firstChild)
                    {
                        parentStack.push(c);
                        c = c.firstChild;
                        continue;
                    }
                    break;
                case "library":
                    OAMetaData.getLibraryRequiredFiles(c, widgetID, absAssetsPath, absOAMPath, results);
                    break;
            }
        }

        // If we have no other nodes to process, and we previously
        // descended into an element, backout so we can continue
        // searching for more elements we're interested in.

        if ((!c || !c.nextSibling) && parentStack.length > 0)
            c = parentStack.pop();

        c = c.nextSibling;
    }

    return results;
};

// parse(domDocument)
//
// DESCRIPTION:
//
// Returns an OAMetaData object that contains the information
// parsed out of the widget OAM XML document that is passed in.
//
// ARGUMENTS:
//
// domDocument - The DOM document element for the widget OAM XML file.
//
// RETURNS:
//
// An OAMetaData object.

OAMetaData.parse = function(widgetID, domDocument, oamPath)
{
    var oam = new OAMetaData(widgetID, domDocument, oamPath);

    // Get <widget> nodes

    var e = oam.doc.getElementsByTagName("widget")[0];
    if (!e)
        return null;

    var wid = e.getAttribute("id"); // required
    if (!wid)
        return null;

    oam.id = wid;

    oam.name = e.getAttribute("name");       // optional
    oam.version = e.getAttribute("version"); // optional

    var aboutURI = e.getAttribute("aboutUri"); // optional
    if (aboutURI)
        oam.aboutURI = aboutURI;

    // @widPrefix is DW proprietary and is the attribute that
    // allows someone to override the default prefix for the
    // __WID__ value.

    var widPrefix = e.getAttribute("widPrefix");
    if (widPrefix)
        oam.widPrefix = widPrefix;
    if (!oam.name)
        oam.name = oam.widPrefix + " " + oam.widgetID;

    var e = oam.doc.getElementsByTagName("dw:binding")[0];
    if (e)
    {
        var v = e.getAttribute("method");
        if (v)
            oam.bindingType = v;

        v = OAMetaData.getTextValueForElement(e);
        if (v)
        {
            oam.bindingTemplate = v;
            oam.bindingTemplateTokens = OAMetaData.parseOAMTemplate(v, oam.propsUsed);
        }
    }

    var configAssetsPath = OAWidgetManager.getWidgetConfigAssetsDirectory(oam.widgetID);

    // Parse all the <requires>, <require> and <library> tags into OAMetaData.Require objects.

    oam.requires = OAMetaData.getRequiredFiles(oam.doc.getElementsByTagName("widget")[0], oam.widgetID, configAssetsPath, oamPath);

    // Get <property> nodes.

    var ea = oam.doc.getElementsByTagName("property");
    for (var i = 0; i < ea.length; i++)
    {
        var e = ea.item(i);
        var o = new OAMetaData.Property(e);
        if (o.name)
        {
            oam.props.push(o);
            oam.propsHash[o.name] = o;
        }
        else
            delete o;
    }

    // Get <content> nodes.

    var ea = oam.doc.getElementsByTagName("content");
    for (var i = 0; i < ea.length; i++)
    {
        var e = ea.item(i);
        var template = OAMetaData.getTextValueForElement(e);
        if (template)
        {
            var o = new Object;
            o.value = template;
            o.tokens = OAMetaData.parseOAMTemplate(template, oam.propsUsed);
            oam.content.push(o);
        }
    }

    // Get <javascript> nodes.

    var ea = oam.doc.getElementsByTagName("javascript");
    for (var i = 0; i < ea.length; i++)
    {
        var e = ea.item(i);
        var template = OAMetaData.getTextValueForElement(e);
        if (template)
        {
            var o = new Object;
            o.value = template;
            o.tokens = OAMetaData.parseOAMTemplate(template, oam.propsUsed);

            o.location = e.getAttribute("location"); // optional
            o.src = e.getAttribute("src");           // optional

            if (!o.location)
                o.location = "afterContent";

            oam.javascript.push(o);
        }
    }

    // Get <dw:css> nodes.

    var ea = oam.doc.getElementsByTagName("dw:css");
    for (var i = 0; i < ea.length; i++)
    {
        var e = ea.item(i);
        var template = OAMetaData.getTextValueForElement(e);
        if (template)
        {
            var o = new Object;
            o.value = template;
            o.tokens = OAMetaData.parseOAMTemplate(template, oam.propsUsed);
            oam.css.push(o);
        }
    }

    // Get <icon> nodes.

    var ea = oam.doc.getElementsByTagName("icon");
    for (var i = 0; i < ea.length; i++)
    {
        var e = ea.item(i);

        // Get the src attribute, convert it to an absolute
        // path and then verify that it actually exists.

        var src = e.getAttribute("src");          // required
        if (src && !OAMetaData.pathIsRemote(src))
        {
            src = dw.relativeToAbsoluteURL(oam.oamPath, "", src);
            if (!DWfile.exists(src))
                src = undefined;
        }

        // We have a valid icon image. Get its dimensions.

        if (src)
        {
            var w = e.getAttribute("width");       // required
            var h = e.getAttribute("height");      // required

            // The src attribute is required.

            if (src && w && h)
            {
                var o = new Object;
                o.src = src;
                o.width = parseInt(w, 10);
                o.height = parseInt(h, 10);
                o.dwShared = e.getAttribute("dw:shared"); // optional
                oam.icons.push(o);
            }
        }
    }

    // Get <dw:help> nodes.

    var ea = oam.doc.getElementsByTagName("dw:help");
    if (ea)
    {
        var e = ea.item(0);
        if (e)
        {
            oam.help.label = OAMetaData.getTextValueForElement(e);
            oam.help.src = e.getAttribute("dw:src");
            if (!oam.help.src)
                oam.help.src = e.getAttribute("src");
        }
    }

    return oam;
};

// parseOAMTemplate()
//
// DESCRIPTION:
//
// Parses the specified template string into a set of tokens that
// can be processed at a later time. As it parses, it collects a list
// of properties that are referenced within the template.
//
// ARGUMENTS:
//
// templateStr - A template from a <content> or <javascript> element.
// propsUsed - A dictionary that will contain keys for each property referenced in the template.
//
// RETURNS:
//
// Array - An array of token objects.

OAMetaData.parseOAMTemplate = function(templateStr, propsUsed)
{
    if (!templateStr)
        return [];

    var tokens = new Array();
    var re = /@@[^@]+@@|__[^_]+__/g;
    var start = 0;
    var nextStart = 0;
    var len = templateStr.length;

    var matches = re.exec(templateStr);

    // matches.index = the zero-based index of match
    // re.lastIndex

    while (matches && matches.length)
    {
        if (matches.index > start)
            tokens.push(new OAMetaData.TokenText(templateStr.substring(start, matches.index)));

        var tkn = new OAMetaData.TokenDataRef(templateStr.substr(matches.index, matches[0].length));
        if (propsUsed)
            propsUsed[tkn.name] = true;

        tokens.push(tkn);

        start = re.lastIndex;
        matches = re.exec(templateStr);
    }

    if (start < len)
        tokens.push(new OAMetaData.TokenText(templateStr.substring(start, len)));

    return tokens;
};

// elementHasCDATA(ele)
//
// DESCRIPTION:
//
// Returns a boolean true value if the specified element has a CDATA
// child node. Returns false if it doesn't.
//
// ARGUMENTS:
//
// ele - The root of the DOM sub-tree that will be used to look for the CDATA node.
//
// RETURNS:
//
// A boolean true if the specified element contains a CDATA node. false if it doesn't.

OAMetaData.elementHasCDATA = function(ele)
{
    var child = ele.firstChild;
    while (child)
    {
        // Dreamweaver represents CDATA as an element with a tag name of <XMLCDATA>.

        if (child.nodeType == 4 /* CDATA */ || (child.nodeType == 1 && child.nodeName.toLowerCase() == "xmlcdata"))
            return true;
        child = child.nextSibling;
    }
    return false;
};

// getTextValueForElement(ele)
//
// DESCRIPTION:
//
// Returns the text/CDATA content between the specified element's begin and close tag.
//
// ARGUMENTS:
//
// ele - The element who's text value you want to retrieve.
//
// RETURNS:
//
// An entity decoded string.

OAMetaData.getTextValueForElement = function(ele)
{
    var val = "";
    var hasCDATA = OAMetaData.elementHasCDATA(ele);
    var child = ele.firstChild;
    while (child)
    {
        switch (child.nodeType)
        {
            case 1: // ELEMENT
                // Dreamweaver represents CDATA as an element named <XMLCDATA>.
                if (child.nodeName.toLowerCase() == "xmlcdata" && child.firstChild && child.firstChild.data)
                    val += child.firstChild.data;
                break;
            case 3: // TEXT
                if (hasCDATA)
                    break;
                // Fall through to CDATA case.
            case 4: // CDATA
                val += child.data;
                break;
        }
        child = child.nextSibling;
    }
    return val;
};

// hashKey(str)
//
// DESCRIPTION:
//
// Hashes the specified string into a binary integer value.
//
// ARGUMENTS:
//
// str - The string to hash.
//
// RETURNS:
//
// An integer.

OAMetaData.hashKey = function(str)
{
  var nHash = 0;
  for (var i = 0; i < str.length; i++)
    nHash = (nHash<<5) + nHash + str.charCodeAt(i);
  return nHash;
};

// btoh(v, useUpperCase, numBytes)
//
// DESCRIPTION:
//
// Converts the specified value (v) into a hex string.
//
// ARGUMENTS:
//
// v - The value to convert.
// useUpperCase - If true use upper case 'A'-'F' letters. If false, use 'a'-'f'.
// numBytes - The length, in bytes, of the data to be converted.
//
// RETURNS:
//
// A hex string.

OAMetaData.btoh = function(v, useUpperCase, numBytes)
{
	// We can't just use Number.toString(16) to convert the
	// entire value because it can result in negative representations.
	// For example, we expect this fe47d4d0, but using toString(16), we'll
	// get -1b82b30.

	if (!numBytes) numBytes = 4;

	var result = "";
	var iters = numBytes * 2;
	for (var i = 0; i < iters; i++)
		result = ((v >> (4*i)) & 0xF).toString(16) + result;

	return useUpperCase ? result.toUpperCase() : result.toLowerCase();
};

// hashWidgetID(wid)
//
// DESCRIPTION:
//
// Returns a hex string that is the hash of the specified widget ID URI.
//
// ARGUMENTS:
//
// wid - String. The URI value of the @id attribute on the <widget> tag of an OAM file.
//
// RETURNS:
//
// A hex string.

OAMetaData.hashWidgetID = function(wid)
{
    return OAMetaData.btoh(OAMetaData.hashKey(wid), true);
};

// conditionalNewLine(str)
//
// DESCRIPTION:
//
// Returns a string containing a single newline character if the specified
// string doesn't already contain a trailing newline character.
//
// ARGUMENTS:
//
// str - String. The string to check for trailing newline characters.
//
// RETURNS:
//
// String. An empty string, or a string containing a single newline in it.

OAMetaData.conditionalNewLine = function(str)
{
    var lastChar = (str && str.length > 0) ? str.charAt(str.length - 1) : "";
    if (!lastChar || (lastChar != '\n' && lastChar != '\r'))
        return "\n";
    return "";
};

// OAMetaData.Property(propEle)
//
// DESCRIPTION:
//
// The constructor for the Property object. This constructor parses the
// specified <property> element and stores the attribute values within the
// Property object.
//
// ARGUMENTS:
//
// propEle - The element who's text value you want to retrieve.
//
// RETURNS:
//
// An entity decoded string.

OAMetaData.Property = function(propEle)
{
    this.initFromElement(propEle);
}

// padIntToStr(intNum, numDigits)
//
// DESCRIPTION:
//
// Converts an integer into a string. If the integer
// contains less digits than numDigits, it pads the
// resulting string with leading zeros.
//
// ARGUMENTS:
//
// intNum - The integer to convert to a string.
// numDigits - The results must contain at least this number of digits.
//
// RETURNS:
//
// String. The padded string representation of the number.

OAMetaData.Property.padIntToStr = function(intNum, numDigits)
{
    var str = intNum + "";
    var pad = numDigits - str.length;
    while (pad-- > 0)
        str = "0" + str;
    return str; 
};

// OAMetaData.Property.dateFormatTokens
//
// DESCRIPTION:
//
// A lookup dictionary of the tokens supported by the @outputFormat attribute
// for a <property dataType="Date"> tag. The key to the dictionary is the token
// name, the value is a function that returns the formatted string value for that
// token based on the Date object passed in.

OAMetaData.Property.dateFormatTokens = {
    YYYY: function(d) { return OAMetaData.Property.padIntToStr(d.getFullYear(), 4); },
    MM:   function(d) { return OAMetaData.Property.padIntToStr(d.getMonth() + 1, 2); },
    DD:   function(d) { return OAMetaData.Property.padIntToStr(d.getDate(),    2); },
    hh:   function(d) { return OAMetaData.Property.padIntToStr(d.getHours(),   2); },
    mm:   function(d) { return OAMetaData.Property.padIntToStr(d.getMinutes(), 2); },
    ss:   function(d) { return OAMetaData.Property.padIntToStr(d.getSeconds(), 2); },
    s:    function(d) { return OAMetaData.Property.padIntToStr(Math.round(d.getMilliseconds()/10), 2); },
    TZD:  function(d) { var z = d.getTimezoneOffset(); var zAbs = Math.abs(z); return (z>0?"+":"") + OAMetaData.Property.padIntToStr(Math.round(zAbs/60), 2) + ":" + OAMetaData.Property.padIntToStr(Math.round(zAbs%60), 2);}
};

// rfc3339ToDate(str)
//
// DESCRIPTION:
//
// Parses a rfc3339 time-stamp string to produce an equivalent
// JS Date object.
// 
// ARGUMENTS:
//
// str - String. The rfc3339 formatted time-stamp to convert to a Date object.
//
// RETURNS:
//
// Date Object

OAMetaData.Property.rfc3339ToDate = function(str)
{
    var matches = str.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[-+]\d\d:\d\d)/);

    // XXX: Should we be returning null instead?

    if (!matches)
        return new Date();

    var year = parseInt(matches[1], 10);
    var month = parseInt(matches[2], 10) - 1;
    var date = parseInt(matches[3], 10);
    var hour = parseInt(matches[4], 10);
    var minute = parseInt(matches[5], 10);
    var seconds = parseInt(matches[6], 10);
    var secondsFraction = matches[7];
    var timeZoneOffset = matches[8];

    secondsFraction = secondsFraction ? (Math.floor(parseFloat(secondsFraction) * 1000)) : 0;

    // XXX: We aren't making use of timeZoneOFfset yet.

    if (timeZoneOffset != "Z")
    {
        var arr = timeZoneOffset.substring(1).split(":");
        timeZoneOffset = ((parseInt(arr[0], 10) * 60) + parseInt(arr[0], 10)) * (timeZoneOffset.charAt(0) == "-" ? -1 : 1);
    }
    else
        timeZoneOffset = 0;

    return new Date(year, month, date, hour, minute, seconds, secondsFraction);
};

// formatDate(dateObj, formatStr)
//
// DESCRIPTION:
//
// Converts the specified Date object to a string using
// the specified format string. Tokens to be used within the
// format string are as follows:
//
//    YYYY = four-digit year
//    MM   = two-digit month (01=January, etc.)
//    DD   = two-digit day of month (01 through 31)
//    hh   = two digits of hour (00 through 23) (am/pm NOT allowed)
//    mm   = two digits of minute (00 through 59)
//    ss   = two digits of second (00 through 59)
//    s    = one or more digits representing a decimal fraction of a second
//    TZD  = time zone designator (Z or +hh:mm or -hh:mm)
//
// http://www.w3.org/TR/NOTE-datetime
//
// ARGUMENTS:
//
// dateObj - The Date object to convert to a string.
// formatStr - A string that describes the date output format.
//
// RETURNS:
//
// String

OAMetaData.Property.formatDate = function(dateObj, formatStr)
{
    if (!dateObj)
        dateObj = new Date();

    if (formatStr == undefined)
        formatStr = "YYYY-MM-DDThh:mm:ss.sTZD";

    for (tkn in OAMetaData.Property.dateFormatTokens)
        formatStr = formatStr.replace(tkn, OAMetaData.Property.dateFormatTokens[tkn](dateObj));

    return formatStr;
};

// OAMetaData.Property.defaultValues
//
// DESCRIPTION:
//
// A lookup table that contains the default string values for each
// dataType supported by the OpenAjax Widget MetaData 1.0 spec. If
// a <property> tag is missing its @defaultValue attribute, this
// table is used to create a defaultValue.

OAMetaData.Property.defaultValues = {
    "array": "[]",
    "boolean": "false",
    "date": OAMetaData.Property.formatDate,
    "error": "",
    "function": "function(){}",
    "number": "0",
    "object": "{}",
    "regexp": "//",
    "string": ""
};

// getDefaultValueForType(dataType, format)
//
// DESCRIPTION:
//
// Returns a string that represents the default value for the
// specified dataType and format.
//
// ARGUMENTS:
//
// dateObj - The Date object to convert to a string.
// formatStr - A string that describes the date output format.
//
// RETURNS:
//
// String

OAMetaData.Property.getDefaultValueForType = function(dataType, format)
{
    var result = OAMetaData.Property.defaultValues[dataType];
    if (result == undefined)
        result = "";
    else if (typeof result == "function")
        result = result();
    return result;
};

// applyOutputFormat(dataType, format, value, outputFormat)
//
// DESCRIPTION:
//
// Converts the specified value into a string based on the
// specified outputFormat.
//
// ARGUMENTS:
//
// dataType - The data type (string, date, number, etc) for the given value.
// format - The format of the value. Really only used for the string dataType.
// value - The value to convert.
// outputFormat - A string that describes how the value should be converted to a string.
//
// RETURNS:
//
// String

OAMetaData.Property.applyOutputFormat = function(dataType, format, value, outputFormat)
{
    if (dataType == "date")
        value = OAMetaData.Property.formatDate(OAMetaData.Property.rfc3339ToDate(value), outputFormat);
    return value;
};

// initFromElement(ele)
//
// DESCRIPTION:
//
// Initializes the property object values to match the specified
// defaults for a <property> tag. If an ele is specified, it then
// overrides the defaults with the values specified in the attributes
// and values of the <property> element.
//
// ARGUMENTS:
//
// propEle - The element who's text value you want to retrieve.
//
// RETURNS:
//
// An entity decoded string.

OAMetaData.Property.prototype.initFromElement = function(ele)
{
    // Reset all values to their defaults.

    this.name = "";                     // @name
    this.defaultValue = undefined;      // @default
    this.value = "";                    // current value
    this.dataType = "string";           // @dataType
    this.format = undefined;            // @format
    this.outputFormat = undefined;      // @outputFormat
    this.outputDefault = undefined;     // @outputDefault
    this.options = [];                  // options/option values

    // Now extract the various values from the property element.

    if (ele)
    {
        var n = ele.getAttribute("name");
        if (n)
        {
            this.name = n;

            var v = ele.getAttribute("dataType");
            if (typeof v == "string")
            {
                // XXX: We don't support multiple data types yet so if we
                //      come across a property that specifies multiple data types,
                //      use the first one in the list.

                if (v.search(/\|/) != -1)
                    v = v.split("|")[0];

                this.dataType = v.toLowerCase();
            }

            this.format = ele.getAttribute("format");
            if (typeof this.format == "string")
                this.format = this.format.toLowerCase();

            this.defaultValue = ele.getAttribute("defaultValue");
            if (this.defaultValue == undefined)
                this.defaultValue = ele.getAttribute("default");

            if (this.defaultValue == undefined)
                this.defaultValue = OAMetaData.Property.getDefaultValueForType(this.dataType, this.format);

            this.value = this.defaultValue;

            this.outputFormat = ele.getAttribute("outputFormat");
            this.outputDefault = ele.getAttribute("outputDefault");

            // If @outputDefault is not specified, it defaults to the format
            // specified within @outputFormat.

            if (this.outputDefault == undefined)
                this.outputDefault = this.outputFormat;

            var opts = ele.getElementsByTagName("option");
            for (var i = 0; i < opts.length; i++)
            {
                var o = opts.item(i);
                var v = OAMetaData.getTextValueForElement(o);
                if (typeof v != undefined)
                    this.options.push(v);
            }
        }
    }
};

OAMetaData.Property.filters = {};

// entityencode(str)
//
// DESCRIPTION:
//
// Entity encodes the specified string.
//
// ARGUMENTS:
//
// str - The string to entity encode.
//
// RETURNS:
//
// An entity encoded string.

OAMetaData.Property.filters.entityencode = function(str)
{
    return OAWidgetManager.encodeEntities(str);
};

// escapequotes(str)
//
// DESCRIPTION:
//
// Escapes specific characters within the specified strings so that it
// can be embedded withing single/double quotes without producing a syntax
// error.
//
// ARGUMENTS:
//
// str - The string to escape.
//
// RETURNS:
//
// An escaped string.

OAMetaData.Property.filters.escapequotes = function(str)
{
    if (str)
    {
        str = str.replace(/\\/g, "\\\\");
        str = str.replace(/["']/g, "\\$&");
        str = str.replace(/\n/g, "\\n");
        str = str.replace(/\r/g, "\\r");
    }
    return str;
};

// getFilteredValue(str)
//
// DESCRIPTION:
//
// Returns the result of running the value of the property through
// the specified filter. If no filterName is specified, the value
// of the property is returned.
//
// ARGUMENTS:
//
// filterName - The name of the filter to use. There are currently only 2 supported values
//              as specified by version 1.0 of the OpenAjax MetaData spec:
//
//                entityencode
//                escapequotes
//
// RETURNS:
//
// A string that is the value of the property *after* it is run through the specified filter.

OAMetaData.Property.prototype.getFilteredValue = function(filterName)
{
    return filterName ? OAMetaData.Property.filters[filterName](this.value) : this.value;
};

// OAMetaData.Token(tknType, value)
//
// DESCRIPTION:
//
// Base class constructor for a token that is created when parsing
// an OAMetaData file template.
//
// ARGUMENTS:
//
// tknType - An enum which can be one of the following values:
//
//               OAMetaData.Token.TKN_TEXT
//               OAMetaData.Token.TKN_DATA_REF
//
// value - The raw string representation of the token.
//
// RETURNS:
//
// N/A

OAMetaData.Token = function(tknType, value)
{
    this.type = tknType;
    this.value = value;
};

// OAMetaData.TokenText(value)
//
// DESCRIPTION:
//
// A constructor for a text token that derives from the base
// Token object.
//
// ARGUMENTS:
//
// value - A string of text that does *NOT* contain any data references.
//
// RETURNS:
//
// N/A

OAMetaData.TokenText = function(value)
{
    OAMetaData.Token.call(this, OAMetaData.Token.TKN_TEXT, value);
};

// OAMetaData.TokenDataRef(value)
//
// DESCRIPTION:
//
// A constructor for a data reference token that derives from the base
// Token object.
//
// ARGUMENTS:
//
// value - The data reference used within the OAM file.
//
// RETURNS:
//
// N/A

OAMetaData.TokenDataRef = function(value)
{
    OAMetaData.Token.call(this, OAMetaData.Token.TKN_DATA_REF, value);

    this.name = "";       // The name of the data reference without the @@ around it.
    this.filterName = ""; // The name of any filter that is to be applied to the value of the data reference.

    // Parse out the name of the data reference and any filter function
    // that should be applied on output.

    var matches = /^@@([^\)]+)\(([^\)]+)\)@@/.exec(value);
    if (matches)
    {
        // A filter function was specified.

        this.filterName = matches[1];
        this.name = matches[2];
    }
    else
        this.name = value.replace(/@@/g, "");
};

OAMetaData.Token.TKN_TEXT = 0;
OAMetaData.Token.TKN_DATA_REF = 1;

