//SHARE-IN-MEMORY=true
// Copyright 2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.

//--------------------------------------------------------------------
// CLASS:
//   AssetInfo
//
// DESCRIPTION:
//   Constructor function for the AssetInfo class. This class is used when creating the parameter 
//   value of dom.copyAssets API call. Call this constructor to create a JavaScript object that 
//   stores the information of the Spry asset. 
//
// ARGUMENTS:
//   src - string - the Spry asset file path relative to Dreamweaver configuration
//   dest - string - the destination to which the Spry asset has to be copied to. 
//                   And it is a relative path to the Spry assets folder of a Dreamweaver site.
//                   Blank or null means this is really a reference, not really an asset to be copied.
//                   In that case we leave the source path alone, no matter what the value of useRelativeSrc is.
//   refType - string - type of reference to be added in the head. Valid values are --
//              "link" - Dreamweaver will add a LINK tag with href attribute
//              "import" - Dreamweaver will add a STYLE tag with @import
//              "javascript" - Dreamweaver will add a SCRIPT tag with type="text/javascript"
//              "vbscript" - Dreamweaver will add a SCRIPT tag with type="text/vbscript"
//              "" - Do not add a reference in the head. Just copy Spry asset from 'src' to 'dest.'
//   useDefault -  boolean - Default is true and Dreamweaver will treat 'dest' argument as a relative path 
//                  to Spry assets folder of the site. Otherwise, 'dest' argument is a relative path to
//                  the site root.
//  useRelativeSrc - boolean - Default is false. If false src url gets inserted as an absolute path
//
//--------------------------------------------------------------------

function AssetInfo(src, dest, refType, useDefault, useRelativeSrc)
{
    if( !useRelativeSrc && dest && dest != '' )
      src =  dw.getConfigurationPath() + "/" + src;
      
    this.srcURL = src;
    this.destURL = dest;
    this.refType = refType;
    this.useDefaultFolder = true;
    
    if (useDefault != null)
        this.useDefaultFolder = useDefault;
}

