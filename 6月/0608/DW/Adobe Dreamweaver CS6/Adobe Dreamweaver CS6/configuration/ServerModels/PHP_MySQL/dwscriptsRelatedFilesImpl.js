/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2009 Adobe Systems Incorporated
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
*************************************************************************/
var phpOpen = '\n<?php\n';
var phpClose = '\n?>';
var phpDiscoverRelatedFilesCodeBlock = 'echo \"<mm:dwdrfml documentRoot=\" . __FILE__ .\">\";$included_files = get_included_files();foreach ($included_files as $filename) { echo \"<mm:IncludeFile path=\" . $filename . \" />\"; } echo \"</mm:dwdrfml>\";';

function markupSourceForDynamicRelatedFileDiscovery(source) {
    // our new source
    var newSource = source.toString();

    var length = newSource.length;
    if (length > 0) {
        // It's is a common practice to write /* ?> */ at the end of code
        //  so create a new copy of the source and remove the comments 
        var strippedSource = stripComments(source);

        var startIndex = strippedSource.lastIndexOf('<?php');

        // don't interpret <?php if it's in a string
        while (isIndexWithinString(strippedSource, startIndex)) {
            startIndex = strippedSource.lastIndexOf('<?php', startIndex - 1);
        }

        if (startIndex >= 0) {

            var appendCloseTag = true;
            var endIndex = strippedSource.lastIndexOf('?>');

            // don't interpret ?> if it's in a string
            while (isIndexWithinString(strippedSource, endIndex)) {
                endIndex = strippedSource.lastIndexOf('?>', endIndex - 1);
            }


            if (endIndex < startIndex) {
                // we found an open tag which did not have
                //  a corresponding close tag so, we don't close it
                // This handles files that contain only php code
                //  http://framework.zend.com/manual/en/coding-standard.php-file-formatting.html#coding-standard.php-file-formatting.general
                appendCloseTag = false;
                newSource += '\n';
            }
            else {
                // The close tag came after the open tag
                //  so we have to reopen it
                newSource += phpOpen;
            }


            // Append the discovery code block to the end
            newSource += phpDiscoverRelatedFilesCodeBlock;

            if (appendCloseTag) {
                // close the php script block
                newSource += phpClose;
            }
        }
    }

    return newSource;
}


function stripComments(source) {
    /* 
    remove block comments 
    */
    var newSource = deleteDelimitedSubstring(source, "/*", "*/", "");

    // remove php comments
    newSource = deleteDelimitedSubstring(newSource, "#", "\n", "\r");

    //remove line-delimited comments
    return deleteDelimitedSubstring(newSource, "//", "\n", "\r");
}

function deleteDelimitedSubstring(source, open, close, alternateClose) {
    var newSource = source.toString();
    var openDelimiter = open.toString();
    var alternateCloseDelimiter = alternateClose.toString();
    var closeDelimiter = close.toString();

    var startIndex = newSource.indexOf(openDelimiter);
    var optionIndex = 0;

    while (startIndex >= 0) {

        // if it's within a string, then we don't want to remove it 
        if (isIndexWithinString(newSource, startIndex)) {
            optionIndex = startIndex + openDelimiter.length;
        }
        else {
            // remove the delimited text and the delimiters
            var endIndex = newSource.indexOf(closeDelimiter, startIndex + openDelimiter.length);

            if ((endIndex == -1) && (alternateCloseDelimiter.length > 0)) {
                endIndex = newSource.indexOf(alternateCloseDelimiter, startIndex + openDelimiter.length);
            }

            var left = newSource.substring(0, startIndex);
            var right = "";

            if (endIndex > startIndex) {
                right = newSource.substr(endIndex + closeDelimiter.length);
            }

            newSource = left + right;
        }
        // look for next
        startIndex = newSource.indexOf(openDelimiter, optionIndex);
    }

    return newSource;
}

function isIndexWithinString(source, index) {
    // short circuit the logic
    if (index == -1) {
        return false;
    }

    // we want to extract just a single line of code
    //  so build the start and end indices around the index
    var newSource = source.toString();

    // short circuit the logic
    if (newSource.length == 0)
        return false;

    var startIndex = newSource.lastIndexOf('\n', index);

    if (startIndex == -1) {
        startIndex = newSource.lastIndexOf('\r', index);
    }

    if (startIndex == -1) {
        startIndex = 0;
    }

    var endIndex = newSource.indexOf('\n', index);

    if (endIndex == -1) {
        endIndex = newSource.indexOf('\r', index);
    }

    if (endIndex == -1) {
        // we want the rest of the string from startIndex 
        //  to the end of the string
        newSource = newSource.substr(startIndex);
    }
    else {
        // we have reduced a large code block
        //  into a single line of code
        newSource = newSource.substring(startIndex, endIndex);
    }

    // adjust for new substring
    index -= startIndex;


    startIndex = newSource.indexOf('"');
    if (startIndex == -1) {
        startIndex = newSource.indexOf("'");
    }

    // look for open/close quotes
    while (startIndex >= 0) {
        // the index we were looking for 
        //  comes before the open quote so it's not in a string
        if (startIndex > index)
            return false;

        // quotes are opened and closed with the same
        //  delimiter so "" or '' only
        //  so we don't think "'blah' blahblahblah"
        //  was closed prematurely
        endIndex = newSource.indexOf(newSource.charAt(startIndex), startIndex + 1);

        // syntax error: the quote was not properly closed
        if (endIndex == -1) {
            return true;
        }

        // the index we were looking for 
        //  comes before the close quote so it's a string
        if (endIndex > index)
            return true;

        startIndex = newSource.indexOf('"', endIndex + 1);
        if (startIndex == -1) {
            startIndex = newSource.indexOf("'", endIndex + 1);
        }


    }

    return false;
}
