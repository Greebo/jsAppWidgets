/* TODO
* shortcuts
* two and more rows of tabs
* 
*/
// global vars
var g_iTabNr     = 0;
var g_aTabWidget = new Array();

// Helper
Element.addMethods( "tr",{
  newTD : function ( p_nElement, p_sColor )
  {
        var v_nTD  = new Element( "td" ).setStyle( {
                             backgroundColor : p_sColor,
                             paddingLeft : "1px",
                             paddingTop  : "1px"
                           } );
       
        p_nElement.appendChild( v_nTD );
        
        return v_nTD;
  }
} );


// Superclass
var TabElement = Class.create( {
  initialize : function( p_nTarget, p_nSource, p_hStyle )
  {
    // Target node
    this.m_nTarget     = $(p_nTarget);
    // Source html code
    this.m_nSource     = $(p_nSource);
    // Style Infos
    this.m_hStyle      = this.convertStyle( $H(p_hStyle) );
    
    this.m_iTabNr      = g_iTabNr; 

    // stores the number of actuall page
    this.m_iActPage = 1;
    this.element = this.generateNode( );
  },
  
  // no change of Style in Superclass
  convertStyle : function( p ){ return p; },
  generateNode : function(){ return 'none'; },
  set :          function( p_iPage ){ this.m_iActPage = p_iPage; 
  },
  get :          function()         { return this.m_iActPage; },
  redraw :       function()      
  { 
    v_nOldElement = this.element;
    this.element.up().replaceChild( this.element = this.generateNode() , v_nOldElement );
  },
  getColor : function( p_iPage )
  {
      // default Color:
    var v_sColor = this.m_hStyle.get('backgroundColor');
    
    // general color
    if (arguments.length == 0 )
      return v_sColor;
      
    // selected Color
    if ( this.m_hStyle.get('selectedColor') != "" && p_iPage == this.m_iActPage)
      v_sColor = this.m_hStyle.get('selectedColor');

    return v_sColor;
  }
} );
/**
 * Creates a tab object. The tab will be only initialized and not shown.
 * To draw the tab use the method {@link Tab#generateTab}
 * 
 * @version 1.0
 * 
 * @param {string}  pstyle CSS design of the tab
 * @param {integer} left x-coordinate of the tab
 * @param {integer} top y-coordinate of the tab
 * @param {integer} width width the tab
 * @param {integer} height height of the tab
 * @param {string}  backColor background color of the tab
 * @param {object}  pages the node or id of the tab will appear
 * 
 * @constructor
 * 
 * @example myTab = new Tab("simple", 20, 150, 250, 150, "#ececec", $( "myTab" ));
 */
var Tab = Class.create( TabElement, {
  
  initialize : function( $super, p_nTarget, p_nSource, p_hStyle )
  {
    // params in member
    $super( p_nTarget, p_nSource, p_hStyle );
    
    // write object in global var
    g_aTabWidget[this.m_iTabNr] = this;
  
    // anker the new tab node in target node
    this.m_nTarget.appendChild( this.element );

    // increase glob var
    g_iTabNr++;
  },

  // intern : call from Superclass
  convertStyle : function( $super, p_hStyle )
  {
    // defaults
    v_hStyle = $H( { cssStyle         : "",
                     left             : "0px",
                     top              : "0px",
                     width            : "0px",
                     height           : "0px",
                     backgroundColor  : "",
                     selectedColor    : "",
                     register         : "top",
                     registerAlign    : "left",
                     registerRows     : '1',
                     registerDistance : '2'
                 } );
    // override default values with parameter hash   
    v_hStyle.update( p_hStyle );
    
    // more than 1 row => align is 'center' !
    if( v_hStyle.get('registerRows') > 1 ) 
      v_hStyle.set('registerAlign','center');
    
    // return converted style --> no call of superclass method
    return v_hStyle;
    
  },
  
  /**
   * method to generate the tab-node
   * 
   * 
   * @version 1.0
   * 
   * @param {integer} actPage which page (first page is 1, 2nd is 2,...) should be open at start
   * 
   * @returns {object} a pointer to the outer tab node
   * 
   * @example getElemTagName( "body", 0 ).appendChild( myTab.generateTab(1) );
   *  
   * @private
   */
  generateNode : function(  )
  {
    
    // new Object for Folders
    this.m_oRegister = new TabRegister( this.m_nTarget, this.m_nSource, this.m_hStyle );
    
    this.m_oBox      = new TabBox(      this.m_nTarget, this.m_nSource, this.m_hStyle );
    // a div over the whole tab

    this.m_nTab = new Element( "table", { 'id' : "Tab" + this.m_iTabNr, cellSpacing: 0, cellPadding : 0} );
    this.m_nTab.addClassName( "Tab-" + this.m_hStyle.get('cssStyle') );
    
    this.m_nTab.setStyle( { left   : this.m_hStyle.get('left'),
                            top    : this.m_hStyle.get('top')
                          } );

    v_nRegisterTD = new Element("td").setStyle( { height: '100%'} );;
    v_nRegisterTD.appendChild( this.m_oRegister.element );  
    v_nBoxTD      = new Element( "td" );
    v_nBoxTD.appendChild( this.m_oBox.element );
    // first Row
    v_nTR = this.m_nTab.insertRow( 0 );

    switch ( this.m_hStyle.get('register'))
    {
      case 'top' :
        v_nTR.appendChild( v_nRegisterTD );
        this.m_nTab.insertRow( -1 ).appendChild( v_nBoxTD );
        break;
      case 'bottom' :
        v_nTR.appendChild( v_nBoxTD );
        this.m_nTab.insertRow( -1 ).appendChild( v_nRegisterTD );
        break;
    }
           
    // return the new node
    return this.m_nTab;
  
   },
  
  /**
   * opens the Page.
   * 
   * @version 1.0
   * 
   * @param {integer} PageNr the page number (first page is 1, 2nd is 2,...) which should be opened
   * 
   * @example myTab.openPage( 2 ) );
   *  
   * @see Tab#getPage 
   */
  set : function( $super, p_iPageNr )
  {
    if ( ! this.m_oRegister.pageValid( p_iPageNr ) )
      return;
      
    $super( p_iPageNr );
    
    v_nRegister = $(this.m_oRegister.element);
    
    // set() for the two inner objects
    this.m_oRegister.set( p_iPageNr );
    this.m_oBox.set(      p_iPageNr );
    
  }
 
});



/**
 * Creates the folders of the tab
 * 
 * @version 1.0
 * 
 * @param {integer} nr number of the tab widget
 * @param {string}  style CSS design of the tab
 * @param {integer} x x-coordinate of the tab
 * @param {integer} y y-coordinate of the tab
 * @param {integer} width width the tab
 * @param {integer} height height of the tab
 * @param {string}  backColor background color of the tab
 * @param {object}  pages the source html code of the tab
 * 
 * @constructor
 * 
 * @private
 */
var TabRegister = Class.create( TabElement, {
  initialize : function ( $super, p_nTarget, p_nSource, p_hStyle )
  {

    // page vars
    this.m_aRegisterNames     = new Array();
    this.m_aRegisterGfx       = new Array();
    this.m_aRegisterActive    = new Array();
      
    // store all tabnames, gfx and active (allow) status
    for( i = 0; v_nMyPage = $$( ".tabPage"  )[i ]; i++  )
    {
      this.m_aRegisterNames[i+1]  = v_nMyPage.getAttribute( "name" );
      this.m_aRegisterGfx[i+1]    = v_nMyPage.getAttribute( "gfx" );
      this.m_aRegisterActive[i+1] = ( v_nMyPage.getAttribute( "inactive" ) != null )? 0 : 1;
    }
    // how many register pages?
    this.m_iCntRegPages = i;
    if ( p_hStyle.get( 'registerRows' ) > i )   p_hStyle.set( 'registerRows', i) ;
    if ( p_hStyle.get( 'registerRows' ) > 100 ) p_hStyle.set( 'registerRows', 100); 
      
    // Define register pages
    //                 bgCol, links    oben/unten  rechts1  rechts2 inner bg
    this.m_sRegColTbl = new Array( "",    "white",   "white",  "gray", "black", p_hStyle.get('backgroundColor'));
    // change color if bottom register
    if( p_hStyle.get('register') == "bottom" )
      this.m_sRegColTbl[2] = "gray";

    // color table for register pages (active & non-active)(top+bottom)
    this.m_aRegPageColTbl    = new Array();
    this.m_aRegPageColTbl[0] = new Array( 0, 0, 2, 2, 0, 0 );
    this.m_aRegPageColTbl[1] = new Array( 0, 1, 5, 5, 4, 0 );
    this.m_aRegPageColTbl[2] = new Array( 1, 5, 5, 5, 3, 4 );
    //    These are set at creation time (look further in code...)
    //this.m_aRegPageColTbl[3] = new Array( 2, 2, 2, 2, 2, 2 ); <- non-active
    //this.m_aRegPageColTbl[3] = this.m_aRegPageColTbl[2];      <- active
    
    // Position of GFX and NAME in RegPageTbl
    this.m_aGfxPos  = ( { x: 2, y : 2 } );
    this.m_aNamePos = ( { x: 3, y : 2 } );

    $super( p_nTarget, p_nSource, p_hStyle );

  },
  
  pageValid : function( p_iPage )
  {
    return ( this.m_aRegisterActive[ p_iPage ] );
  },
  /**
   * generates the Registers
   * 
   * @param {integer} actPage the page number (first page is 1, 2nd is 2,...) which should be the start page
   * 
   * @private
   */
   
   generateNode : function()
   {
     // align
     var v_sRegisterAlign = this.m_hStyle.get('registerAlign');
     
     // table over the register rows
     var v_nTable = new Element( "table", { cellSpacing : 0, cellPadding : 0 } );
     v_nTable.setStyle( {  width : '100%' } );

     var v_nTR = "";
     var v_nTD = "";
     var v_iAnzRows = this.m_hStyle.get( 'registerRows' );
     var v_fOffset = ( this.m_iCntRegPages / v_iAnzRows );
     var v_iDistanceIndex = 0;
     
     // build all register rows in a table
     for ( var v_nRow = 1; v_nRow <= v_iAnzRows; v_nRow++ )
     {
       // create new register row
       v_iStart = parseInt( v_fOffset * (v_nRow-1)) + 1;
       v_iEnd   = parseInt( v_fOffset * v_nRow);
       v_bActPageInRegister = ( v_iStart <= this.m_iActPage && v_iEnd >= this.m_iActPage );
       v_nRegisterRow = this.createRow( v_iStart, v_iEnd, v_bActPageInRegister );

       if ( !v_bActPageInRegister )
       {
         // make overlapping
         v_sDistance = (++v_iDistanceIndex * parseInt(this.m_hStyle.get('registerDistance')) + 2) 
                          * ( this.m_hStyle.get('register')  == 'bottom' ? (-1): 1 );
         
         v_nRegisterRow.setStyle( { top: v_sDistance +'px', position:'relative', zIndex : 100 - v_nRow } );

         v_nTR = v_nTable.insertRow( (-1) * (this.m_hStyle.get('register')  == 'bottom') );
       }
       else // first line (front line)
       {
         v_nRegisterRow.setStyle( {position : 'relative', zIndex : 100 } );
         v_nTR = v_nTable.insertRow( (-1) * (this.m_hStyle.get('register') == 'top'  ) );
       }

       // append in table
       v_nTD = new Element( "td" );
      
       v_nTD.appendChild( v_nRegisterRow );
          
       v_nTR.appendChild( v_nTD );
     } 

     // return the whole node
     return v_nTable;
   },
     
   
   
   
   createRow : function( p_iLeft, p_iRight, p_bActPageInRegister )
   {
     // table over all page Registers
     var v_nTable = new Element( "table", { cellSpacing : 0, cellPadding : 0 } );
     v_nTable.setStyle( { 'width' : '100%' } );

     // new row in table
     var v_nTR = $(v_nTable.insertRow(0));
     var v_sRegisterAlign = this.m_hStyle.get('registerAlign');
     
     // left filler    
     if ( this.m_iActPage != p_iLeft || v_sRegisterAlign == 'right' )
         v_nTR.appendChild( this.createFiller( true, p_bActPageInRegister ) );

     // draw all pages
     for( i = p_iLeft; i <= p_iRight; i++)
     {
       // td for page
       var v_nTD    =  new Element( "td" );
       if( this.m_hStyle.get('register') == 'bottom' )
         v_nTD.vAlign = "top";
       else
         v_nTD.vAlign = "bottom";
       

       // make the register page        
       v_nRegister = this.createRegisterPage( i, p_bActPageInRegister );

       // anker the register page in td of Register
       v_nTD.appendChild( v_nRegister );
       
       // anker td in row of Register
       v_nTR.appendChild( v_nTD );
     }
     
     // right filler (createFiller returns the td node)
     if (  ! (p_iRight == this.m_iActPage && v_sRegisterAlign != 'left' ) )
       v_nTR.appendChild( this.createFiller( false, p_bActPageInRegister ) );

     // return the new Register node
     return v_nTable;
   },
   
   
   
   
   /**
    * create the left or ritht filler. 
    * 
    * @param {boolean} create left filler ( false : create right filler)
    * 
    * @return filler td node 
    * @private
    */
   createFiller : function( p_bLeft, p_bDrawBorder )
   {
     // new td node for the filler
     v_nTD = new Element("td").addClassName( "filler" );
  
     v_sRegisterAlign = this.m_hStyle.get('registerAlign');
     
     // stretch  filler?
     if(   (  p_bLeft && v_sRegisterAlign == 'right' )
       ||  ( !p_bLeft && v_sRegisterAlign == 'left' ) )
       v_nTD.setStyle( { width : "100%" } );

     // bottom or top border
     if ( p_bDrawBorder )
     {
       switch( this.m_hStyle.get('register') )
       {
         case 'bottom': v_nTD.style.borderTop    = "1px solid gray";  break;
         case 'top'   : v_nTD.style.borderBottom = "1px solid white"; break;
       }
     }
       v_nTD.setStyle( { height : "13px"  } );

     // for compatibility ie 6
     v_nBox = new Element( "div" ).setStyle( {width : "1px"} );
     v_nTD.appendChild( v_nBox );
  
     return v_nTD;
 },
   
   
 /**
  * draw a page in the register
  * 
  * @param i number of the tab
  * 
  * @returns the node
  * 
  * @private 
  */
  createRegisterPage : function( p_iPage, p_bCutBorder )
  {
    var v_sSelected = "";
    // Page is the actual one?
    if ( p_iPage == this.m_iActPage )
    {
      v_sSelected = "Selected"; 
      this.m_aRegPageColTbl[3] = this.m_aRegPageColTbl[2];
    }
    else // not actual
      this.m_aRegPageColTbl[3] = new Array( 2, 2, 2, 2, 2, 2 );
 
    // Set the ColorColor:
    this.m_sRegColTbl[5] = this.getColor( p_iPage );   
      
    // generate the table element
    var v_nTable = new Element( "table", { cellSpacing: 0, cellPadding : 0 });
//    v_nTable.setStyle({ width : "100%" });

    // start and end point of register page 
    v_iStartColmn = ( p_iPage == this.m_iActPage + 1 && p_bCutBorder ? 2 : 0 );
    v_iEndColmn   = ( p_iPage == this.m_iActPage - 1 && p_bCutBorder ? 3 : 5 );

    // 4 rows
    for( var v_iRow = 0 ; v_iRow < 4; v_iRow++ )
    {
      // new TR on first child or last
      v_nTR = $(v_nTable.insertRow( (this.m_hStyle.get('register') == 'top') * v_iRow ));
        
      for( var v_iClmn = v_iStartColmn; v_iClmn <= v_iEndColmn; v_iClmn++ )
      {
        // new td in tr
        v_nTD =  v_nTR.newTD( this.m_sRegColTbl[ this.m_aRegPageColTbl[v_iRow][v_iClmn] ] );
          
        // gfx node must be filled
        if ( v_iRow == this.m_aGfxPos.y && v_iClmn == this.m_aGfxPos.x && this.m_aRegisterGfx[p_iPage] ) 
        {
          v_nTD.addClassName( "tabsGfx" + v_sSelected );
          v_nTD.appendChild( new Element( "img", { 'src' : this.m_aRegisterGfx[p_iPage] +''}  ).setStyle( { border : 'none' } ) );
          
        }
        else if( v_iRow == this.m_aNamePos.y && v_iClmn == this.m_aNamePos.x ) //Text node
        {
          v_nTD.addClassName( "tabsName" + v_sSelected );
          v_nTD.style.width = "100%";
          v_nTD.appendChild( document.createTextNode( this.m_aRegisterNames[p_iPage] ));
        }
      } //for : all columns
    } // for : all Rows

    // <a> tag over the table    
    v_nA = new Element( "a" );
    v_nA.className = this.m_aRegisterActive[p_iPage] == 1  ? "tabsName" + v_sSelected : "tabsNameInactive";
    if ( p_iPage == this.m_iActPage )
      v_nA.href = "javascript:void(0)";
    else
      v_nA.href = "javascript:setPage( " + this.m_iTabNr + ", " + p_iPage + " );";

    // for ie : need to activate the <a> tag!
    v_nTable.observe('click', linkClick );
    v_nA.appendChild( v_nTable );

    // return the new register node
    return v_nA;
  },
   


  
  
  set : function( $super, p_iPageNr )
  {
    $super( p_iPageNr );
    
    this.redraw();
  }
  
});



/**
 * Creates the Box of the tab
 * 
 * @version 1.0
 * 
 * @param {integer} nr number of the tab widget
 * @param {string}  style CSS design of the tab
 * @param {integer} x x-coordinate of the tab
 * @param {integer} y y-coordinate of the tab
 * @param {integer} width width the tab
 * @param {integer} height height of the tab
 * @param {string}  backColor background color of the tab
 * @param {object}  pages the source html code of the tab
 * 
 * @constructor
 * 
 * @private
 */
var TabBox = Class.create( TabElement, {
  initialize : function( $super, p_nTarget, p_nSource, p_hStyle )
  {
    $super( p_nTarget, p_nSource, p_hStyle );
  },
  generateNode : function(   )
  {
    // box over the tab
    this.m_nBox = new Element( "div",
      {
        id : "TabBox" + this.m_iTabNr
      } );

    this.m_nBox.setStyle(
      {
        borderRight     : '1px solid black',
        borderLeft      : '1px solid white',
        borderTop       : '1px solid white',
        borderBottom    : '1px solid black',
        backgroundColor : this.getColor( this.m_iActPage ),
        width           : this.m_hStyle.get('width')
      } );
    
    // remove border at register side
    switch ( this.m_hStyle.get('register') )
    {
      case 'bottom' : this.m_nBox.style.borderBottom = ''; break;
      case 'top'    : this.m_nBox.style.borderTop    = ''; break;
    }

    // inner box for 2nd border column
    var v_nInnerBox = new Element( "div" ).addClassName( "tabBox" );
    v_nInnerBox.style.height = this.m_hStyle.get('height');
    if ( this.m_hStyle.get('register') != 'right' )
      v_nInnerBox.style.borderRight = '1px solid gray';   
    if ( this.m_hStyle.get('register') != 'bottom' )
      v_nInnerBox.style.borderBottom = '1px solid gray';   

    // set the actual page
    this.set(  this.m_iActPage );
    
    v_nInnerBox.appendChild( this.m_nSource );
    this.m_nBox.appendChild( v_nInnerBox);

    return this.m_nBox;
  },
  
  set : function( $super, p_iPageNr )
  {
    if ($super != "")
      $super( p_iPageNr );
    
    $A($$( ".tabPage" )).each( Element.hide );
    $$( ".tabPage" )[this.m_iActPage -1].setStyle( { display : "block" });
    if ( this.element)
      this.element.style.backgroundColor = this.getColor(this.m_iActPage );
  }

});



/** selects a special page in a tab. This is needed for the links on the Registers :
 * javascript:setPage( 0, 1 )
 * 
 * @param tabNr number of the tab
 * @param pageNr number of the page
 * 
 * @private
 */
function setPage( p_iTabNr, p_iPageNr )
{
   g_aTabWidget[p_iTabNr].set( p_iPageNr );
   
}

// helper
function linkClick( e )
{
  // do the upper click event (only in ie)
  if( e.findElement("a").click ) 
    e.findElement("a").click();
}
