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

if( typeof CodeNav == 'undefined' ) CodeNav = {};
if( typeof CodeNav.Utils == 'undefined' ) CodeNav.Utils = {};

function docOnMouseMove(e)
{
    CodeNav.Utils.mouseX = e.clientX;
    CodeNav.Utils.mouseY = e.clientY;
    if(CodeNav.Utils.IsShowingTip() && !CodeNav.Utils.IsOverTippedObject())
    {
        CodeNav.Utils.DoHidetoolCurrentTip();
    }
}

document.onmousemove = docOnMouseMove;

CodeNav.Utils.Showtooltip = function(obj)
{
    if(CodeNav.Utils.IsShowingTip() && CodeNav.Utils.tippedObject != obj)
    {
        CodeNav.Utils.DoHidetoolCurrentTip();
    }
        
    var sib = obj.nextSibling;
    while(sib && sib.className != 'tooltip')
    {
        sib = sib.nextSibling;
    }
    
    if(sib)
    {
        var top = 0;
        // Start off showing the tooltip as high as possible, to prevent the forcing of scrollbars
        var parentPos = this.GetWindowPos(obj.offsetParent);
        top = 2 - parentPos[1];
        
        sib.style.top = top + 'px';
        var newTop = obj.offsetTop + obj.offsetHeight - 3;
        // We've already sized the dialog to be wide enough to fit the tip to allow 
        // room without scrolling or overflow, but let's make sure we don't obscure the item 
        // too much in the case of someone shrinking the dialog, or it being wider than the
        // max width
        var newLeft = obj.offsetLeft + obj.offsetWidth + 5;
        var minLeft = obj.offsetLeft + Math.min(30, obj.offsetWidth);  // never cover up the whole item 
        newLeft = Math.min(newLeft, minLeft);
        sib.style.left = newLeft + 'px';
        sib.style.display = 'block';
        CodeNav.Utils.ForceToWindowAt(sib, newLeft, newTop, minLeft);
        CodeNav.Utils.tippedObject = obj;
    }
}

CodeNav.Utils.Hidetooltip = function(obj)
{
}
CodeNav.Utils.DoHidetoolCurrentTip = function()
{
    if(!CodeNav.Utils.IsShowingTip())
        return;
    var obj = CodeNav.Utils.tippedObject;
    var sib = obj.nextSibling;
    while(sib && sib.className != 'tooltip')
    {
        sib = sib.nextSibling;
    }
    if(sib)
    {
        sib.style.display = 'none';
        CodeNav.Utils.tippedObject = null;
        sib.style.height = 'auto';
    }    
}

CodeNav.Utils.IsShowingTip = function()
{
    return (typeof (CodeNav.Utils.tippedObject) != 'undefined' && CodeNav.Utils.tippedObject != null);
}
CodeNav.Utils.IsOverObject = function(obj, x, y)
{
    var pos = this.GetWindowPos(obj);
    if(x < pos[0])
        return false;
    if(y < pos[1])
        return false;
    if(x > pos[0] + obj.offsetWidth)
        return false;
    if(y > pos[1] + obj.offsetHeight)
        return false;
    return true;
}
CodeNav.Utils.IsOverTippedObject = function()
{
    if(!CodeNav.Utils.IsShowingTip())
        return false;
    return CodeNav.Utils.IsOverObject(CodeNav.Utils.tippedObject, CodeNav.Utils.mouseX, CodeNav.Utils.mouseY);
}
CodeNav.Utils.ForceToWindow = function(obj)
{
    var availableHeight = window.innerHeight - CodeNav.Utils.GetReservedFooterHeight();
    var pos = this.GetWindowPos(obj);
    if(pos[0] + obj.offsetWidth > window.innerWidth)
    {
        var left = obj.offsetLeft + window.innerWidth - (pos[0] + obj.offsetWidth) - 2;
        obj.style.left = left + 'px';
    }
    if(pos[1] + obj.offsetHeight > availableHeight)
    {
        var top = obj.offsetTop + availableHeight - (pos[1] + obj.offsetHeight) - 2;
        obj.style.top = top + 'px';
        var newPos = CodeNav.Utils.GetWindowPos(obj);
        // We need to make sure here that the new top of the dom element is below the top of the window too
        if(parseInt(newPos[1]) < 1)
            obj.style.top = '2px';
    }
};
CodeNav.Utils.ForceToWindowAt = function(obj, desiredLeft, desiredTop, minLeft)
{
    var pos = this.GetWindowPos(obj.offsetParent);
    var left = desiredLeft;
    var top = desiredTop;
    
    var availableHeight = window.innerHeight - CodeNav.Utils.GetReservedFooterHeight() - 2; // 2 for other borders
    if(pos[0] + left + obj.offsetWidth > window.innerWidth)
    {
        left = window.innerWidth - (pos[0] + obj.offsetWidth) - 2;
        left = Math.max(left, minLeft);
    }
    if(pos[1] + top + obj.offsetHeight > availableHeight)
    {
        top = availableHeight - (pos[1] + obj.offsetHeight) - 2;
    }
    obj.style.left = left + 'px';
    obj.style.top = top + 'px';
    obj.style.height = 'auto';
    obj.style.overflow = 'hidden';
    var newPos = CodeNav.Utils.GetWindowPos(obj);
    // We need to make sure here that the new top of the dom element is below the top of the window too
    var theTop = parseInt(newPos[1]);
    if(theTop < 0)
    {
        var newTop = 2 - pos[1];
        if(pos[1] + newTop + obj.offsetHeight >= availableHeight)
        {
            var padtop = document.defaultView.getComputedStyle(obj,null).getPropertyValue('padding-top');
            var padbottom = document.defaultView.getComputedStyle(obj,null).getPropertyValue('padding-bottom');
            var padding = parseInt(padtop) + parseInt(padbottom);   
            var bordertop = document.defaultView.getComputedStyle(obj,null).getPropertyValue('border-top-width');
            var borderbottom = document.defaultView.getComputedStyle(obj,null).getPropertyValue('border-bottom-width');
            var border = parseInt(bordertop) + parseInt(borderbottom);   
            obj.style.height = availableHeight - 2 - padding - border + 'px';
        }
        obj.style.top = newTop + 'px';
    }
};

CodeNav.Utils.GetReservedFooterHeight = function()
{
     var footer = document.getElementById("formwrapper");
     var height = parseInt(document.defaultView.getComputedStyle(footer,null).getPropertyValue('padding-top'));
     height +=  parseInt(document.defaultView.getComputedStyle(footer,null).getPropertyValue('padding-bottom'));
     height +=  parseInt(document.defaultView.getComputedStyle(footer,null).getPropertyValue('height'));
     height +=  parseInt(document.defaultView.getComputedStyle(footer,null).getPropertyValue('border-top-width'));
     height +=  parseInt(document.defaultView.getComputedStyle(footer,null).getPropertyValue('border-bottom-width'));
     return height;
}
CodeNav.Utils.GetWindowPos = function(obj)
{
    var docPos = this.GetDocPos(obj);
    return [docPos[0] - window.pageXOffset, docPos[1] - window.pageYOffset];
};

CodeNav.Utils.GetDocPos = function(obj)
{
    var left = 0
    var top = 0;
    if(obj.offsetParent)
    {
        left = obj.offsetLeft;
        top = obj.offsetTop;
        while(obj = obj.offsetParent)
        {
            left += obj.offsetLeft - obj.scrollLeft;
            top += obj.offsetTop - obj.scrollTop;
        }
    }
    return [left, top];
};
