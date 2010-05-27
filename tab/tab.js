/* TODO
* shortcuts
* register left and right
* different color for each tab
* border colors in a hash that could be changed (set)
* close and add registers
* more styles
*/

// global vars
var g_iTabNr     = 0;
var g_aTabWidget = new Array();


/**
 * Superclass of other tab classes 'Tab', 'TabRegister', 'TabBox'
 *  
 * @param {String|Node}  source the node or id of the source html-div
 * @param {Hash}    style  the style attributes for the tab. Only the cssStyle entry is mandatory.
 * Look the example for more infos and the default values (in brackets)
 * @param {Object} [caller] Use this parameter, if widget is called from an other widget. 
    Do not use this parameter if you do not know what you doing :). Normally this parameter is not needed.
 * 
 * @example var myTab = new TabElement(   "myTab",           
          { cssStyle         : 'simple',  // css class of the div
            left             : '10px',    // left position ("0px")
            top              : '10px',    // top position ("0px")
            width            : "250px",   // width ("0px" -> auto)   
            height           : "200px",   // height ("0px" -> auto)
            selectedColor    : '#d48080', // color of the active 
                                          // page ('')
            regAlign         : "left",    // register align  
                                          // values: ("left"),"right", "center"
            regPos           : "top",     // register position 
                                          // values: ("top"),"bottom"
            regRows          : '1',       // register row count ("1")
                                          // values (1), 2, .... n 
                                          // (max = count of pages)
            regDistance      : '4px'      // offset ("0px") 
                                          // try this attribute if regRows >1
                                          // and the tab register position is wrong
          }                             );
                                        
 * @class
 */
var TabElement = Class.create( 
/**
 * @lends TabElement.prototype
 */
{
  /**
   * @constructor
   * @private
   */
  initialize : function( p_nSource, p_hStyle, p_oCaller )
  {
    // if parent exist, the parent is the master node
    try { 
      this.m_iTabNr        = p_oCaller.m_iTabNr; 
      this.m_bIsMainObject = false; 
        }
    catch (e) { // otherwise this node is the master node
      // write object in global var
      g_aTabWidget[this.m_iTabNr = g_iTabNr++] = this;
      this.m_bIsMainObject = true;
              };

    // stores the number of actual page
    this.m_iActPage = 1;

    // Source html code
    this.m_nSource     = $(p_nSource);

    // id of the Source HTML -> will be id of the created element
    this.m_sID   = this.m_nSource.id;
    
    // Style Infos in this.m_hStyle
    this.initStyle( $H(p_hStyle) );

    // page vars
    this.m_aRegName      = new Array();
    this.m_aRegGfx       = new Array();
    this.m_aRegActive    = new Array();
      
    // store all tabnames, gfx and active (allow) status
    for( i = 0; v_nMyPage = $$( "#"+this.m_nSource.id+" .tabPage"  )[i ]; i++  )
    {
      this.m_aRegName[i+1]   = v_nMyPage.getAttribute( "name" );
      this.m_aRegGfx[i+1]    = v_nMyPage.getAttribute( "gfx" );
      this.m_aRegActive[i+1] = ( v_nMyPage.getAttribute( "inactive" ) != null )? 0 : 1;
    }
    // how many register pages?
    this.m_iCntRegPages = i;

    // generate the element, anker  and identify it, if master
    if (  this.m_bIsMainObject )
    {
      this.element = this.m_nSource;
      this.redraw();
    }
    else
      // only create element
      this.element = this.create( );
  },
  /**
   * checks the hash style, set to default values if necessary and do other important initializing stuff.
   * @param {Hash} style the css class
   * @private
   */
  initStyle :    function( p_hStyle )      
  {
    // no convert if child; parent has it already done
    if ( !this.m_bIsMainObject && this.m_hStyle )
      return;
    
    // defaults
    this.m_hStyle = $H( { cssStyle         : "",
                          left             : "0px",
                          top              : "0px",
                          width            : "0px",
                          height           : "0px",
                          backgroundColor  : "",
                          selectedColor    : "",
                          regPos           : "top",
                          regAlign         : "left",
                          regRows          : '1',
                          regDistance      : '2'
                       } );

    // override default values with parameter hash   
    this.m_hStyle.update( p_hStyle );

    // more than 1 row => align is 'center' !
    if( this.m_hStyle.get('regRows') > 1 ) 
      this.m_hStyle.set('regAlign','center');
  },
  
  /**
   * get the active page number (starting with 1).
   * @example var actPage = myTab.get();
   * @returns {Integer} the active page number
   * @see TabElement#set
   */
  get      : function() { return this.m_iAktPage; },
  
  /**
   * get the style attributes
   * look at @link TabElement# for the hash details 
   * 
   * @example var tabStyle = myTab.getStyle();
   * @returns {Hash} the style attributes
   * @see TabElement#setStyle
   */
  getStyle : function() { return m_hStyle; },
  
  /**
   * get the name of a page.
   *
   * @example var tabName = myTab.getName( 2 );
   * @param {Integer} page the page number
   * @returns {String} the name of a page
   * @see TabElement#setName
   * @see TabElement#getGfx
   * 
   */
  getName  : function( p_iPage ) { return this.m_aRegName[p_iPage] ;},
  
  /**
   * get the path of the gfx.
   * 
   * @example var tabGfx = myTab.getGfx( 2 );
   * @param {Integer} page the page number (starting with 1)
   * @returns {String} the path of the gfx in the page
   * @see TabElement#setGfx
   * @see TabElement#getName
   */
  getGfx   : function( p_iPage ) { return this.m_aRegGfx[p_iPage]; },
  
  /**
   * get the color of a page.
   * 
   * @example var tabCol = myTab.getColor( 2 );
   * @param {Integer} [page] the page number (starting with 1). 
   * If no page, the background color is returned
   * @returns {String} the color of the page
   * @see TabElement#setColor
   * @see TabElement#getName
   * @see TabElement#getGfx
   */
  getColor : function( p_iPage ) // 
  {
      // default Color:
    var v_sColor = this.m_hStyle.get('backgroundColor');
    
    // general color
    if (arguments.length == 0 )
      return v_sColor;
      
    // selected Color
    if ( this.m_hStyle.get( 'selectedColor' ) != "" && p_iPage == this.m_iActPage)
      v_sColor = this.m_hStyle.get( 'selectedColor' );

    return v_sColor;
  },
  
  /**
   * checks whether the page is active.
   * 
   * @example var isAct = myTab.isActive( 2 );
   * @param {Integer} page the page number (starting with 1)
   * @returns {Boolean} the active status
   * @see TabElement#isInactive
   * @see TabElement#setActive
   */
  isActive   : function( p_iPage ) { return !isInactive(p_iPage); },
  
  /**
   * checks whether the page is inactive
   * 
   * @example var isInact = myTab.isInactive( 2 );
   * @param {Integer} the page number (starting with 1)
   * @returns {Boolean} the inactive status
   * @see TabElement#isActive
   */
  isInactive : function( p_iPage ) { return ( !this.m_aRegActive[ p_iPage ] || (this.m_iCntRegPages < p_iPage)); },

  /**
   * opens the next page. If the active page is the last, the first page will be opened.
   *
   * @example myTab.next();
   * @see TabElement#prev
   * @see TabElement#setInactive
   */
  next       : function()
  {
    var v_bfound = false;
    var v_iActPage = this.m_iActPage +1;
    while( !v_bFound && v_iActPage != vthis.m_iActPage )
    {
      if( v_iActPage > this.m_iCntRegPages )
        v_iActPage = 1;
      if( this.isActive( v_iActPage ) )
          v_bFound = true;
    }
    this.set(  v_iActPage );
  },
  /**
   * opens the previous page. If the active page is the first, the last page will be opened.
   *
   * @example myTab.prev();
   * @see TabElement#next
   */
  prev       : function()
  {
    var v_bfound = false;
    var v_iActPage = this.m_iActPage -1;
    while( !v_bFound && v_iActPage != vthis.m_iActPage )
    {
      if( v_iActPage == 0 )
        v_iActPage = this.m_iCntRegPages;
      if( this.isActive( v_iActPage ) )
          v_bFound = true;
    }
    this.set( v_iActPage );
  },
  /**
   * recreates the element and replace than the old node.
   * Normally this method is intern (private) and should not be necessary outside. Use it carefulle!
   * 
   * @example myTab.redraw();
   */
  redraw :       function()      
  { 
    v_nNewElement = this.create();
    this.element.replace( v_nNewElement );
    this.element  = v_nNewElement; 

    if ( this.m_bIsMainObject ) // node is master
    { 
      //  this.m_nSource.replace( this.element );
      this.m_nSource = this.element;

      this.element.id = this.m_sID;
      // replace source html node
      // add class name
      this.element.addClassName( this.m_hStyle.get('cssStyle') );
    }
  },

  /**
   * opens a specific register page
   *
   * @example myTab.set( 2 );
   * @param {Integer} page the page number (starting with 1)
   * @see TabElement#get
   */
  set :  function( p_iPage )
  { 
    if ( !this.isInactive( p_iPage ) )
      this.m_iActPage = p_iPage;
    else
      return false;
  },

  /**
   * sets a page to active status (allowed)
   *
   * @example myTab.setActive( 2 );
   * @param {Integer} page the page number (starting with 1)
   * @see TabElement#isActive
   * @see TabElement#setInactive
   */
  setActive   : function( p_iPage ){ this.m_aRegActive[ p_iPage ] = 1 ; this.redraw(); },

  /**
   * sets a page to inactive status (disallowed)
   *
   * @example myTab.setInactive( 2 );
   * @param {Integer} page the page number (starting with 1)
   * @see TabElement#isInactive
   * @see TabElement#setActive
   */
  setInactive : function( p_iPage ){ this.m_aRegActive[ p_iPage ] = 0 ; this.redraw(); },
 
  /**
   * sets a name of a page
   *
   * @example myTab.setName( 2, "new Name" );
   * @param {Integer} page the page number (starting with 1)
   * @param {String} name the new name (=text) of the page 
   * @see TabElement#getName
   */
  setName     : function( p_iPage, p_sName ) { this.m_aRegName[p_iPage] = p_sName; this.redraw(); },
  /**
   * sets a gfx path of a page
   *
   * @example myTab.setGfx( 2, "/gfx/myPic.gif" );
   * @param {Integer} page the page number (starting with 1)
   * @param {String} gfxPath the gfx path
   * @see TabElement#getGfx
   */
  setGfx      : function( p_iPage, p_sGfx  ) { this.m_aRegGfx [p_iPage] = p_sGfx; this.redraw(); },
  /**
   * sets the style of the widget. Only the attributes in the hash will be changed! The other attributes stay untouched.
   *
   * @example myTab.setStyle( { top : '10px', left : '10px' });
   * @param {Hash} style the new style attributes
   * @see Ta  bElement#getStyle
   */
  setStyle    : function( p_hStyle ){ this.m_hStyle.update( p_hStyle ); this.redraw(); }
} );


/**
 * Creates a tab object. The source div will be replayed by the generated tab
 *  
 * @class
 * @version 1.0
 * @param {string}  source node or id of the source (html)
 * @param {hash}    style  the style assignments for the tab
 * @param {integer} caller optional parameter, if widget is called from an other widget
 * @extends TabElement
 * @example var myTab = new Tab(   "myTab",           
                        { cssStyle         : 'simple',  
                          left             : '10px', 
                          top              : '10px',
                          width            : "250px",       
                          height           : "200px",   
                          selectedColor    : '#d48080', 
                          regAlign         : "left",   
                          regPos           : "top", 
                          regRows          : '1',      
                          regDistance      : '4px'     
                        }
                                );
 */
var Tab = Class.create( TabElement, 
/**
 * @lends Tab#
 */
{
  initialize : function( $super, p_nSource, p_hStyle, p_oCaller )
  {
    $super( p_nSource, p_hStyle, p_oCaller );

  },

  // no extra init (initialze from parend is enough

  create : function()
  {
    // new Object for Folders
    if ( !this.m_oRegister )
      this.m_oRegister = new TabRegister( this.m_nSource, this.m_hStyle, this );
    // new Box
    if ( !this.m_oBox )
      this.m_oBox      = new TabBox(      this.m_nSource, this.m_hStyle, this );

    // a div over the whole tab
    this.m_nTab = new Element( "table", {cellSpacing: 0, cellPadding : 0} );
    this.m_nTab.setStyle( { left   : this.m_hStyle.get('left'),
                            top    : this.m_hStyle.get('top')
                          } );


    //insert the two TabElements (register + box) in the node
    v_nRegisterTD = new Element("td");
    v_nRegisterTD.appendChild( this.m_oRegister.element );  
    v_nBoxTD      = new Element( "td" );
    v_nBoxTD.appendChild( this.m_oBox.element );

    // which order? first register than box? or reverse?
    v_nTR = this.m_nTab.insertRow( 0 );
    switch ( this.m_hStyle.get('regPos'))
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
    // return the new created node
    return this.m_nTab;
  },
  
  /**
   * opens the specified page in the tab widget.
   * @version 1.0
   * @param {intern}  $super
   * @param {integer} p_iPage the page number (first page is 1, 2nd is 2,...) which should be opened
   * @example myTab.set( 2 ) );
   * @see Tab#get
   */
  set : function( $super, p_iPage )
  {
    $super( p_iPage );
    this.m_oRegister.set( p_iPage );
    this.m_oBox.set(      p_iPage );
  },
  /**
   * reactivate a disallowed page 
   * 
   * @version 1.0
   * 
   * @param {integer} PageNr the page number (first page is 1, 2nd is 2,...) which should be opened
   * 
   * @example myTab.setActive( 2 ) );
   *  
   * @see Tab#setInactive
   */ 
  setActive   : function( $super, p_iPage )
  {
    $super( p_iPage );
    this.m_oRegister.setActive( p_iPage );
    this.m_oBox.setActive(      p_iPage );
  },
  /**
   * set a page to disallowed
   * 
   * @version 1.0
   * 
   * @param {integer} p_iPage the page number (first page is 1, 2nd is 2,...) which should be opened
   * 
   * @example myTab.setInactive( 2 ) );
   *  
   * @see Tab#setActive
   */ 
  setInactive : function( $super, p_iPage ) 
  {
    $super( p_iPage );
    this.m_oRegister.setInactive( p_iPage );
    this.m_oBox.setInactive(      p_iPage );
  },
  /**
   * changes the name (text) in a page
   * 
   * @version 1.0
   * 
   * @param {integer} PageNr the page number (first page is 1, 2nd is 2,...) which should be opened
   * @param {string}  Name   the new Name
   * 
   * @example myTab.setName( 2, "newName" ) );
   *  
   * @see Tab#getName
   */ 
  setName     : function( $super, p_iPage, p_sName ) 
  {
    $super( p_iPage, p_sName );
    this.m_oRegister.setName( p_iPage, p_sName );
    this.m_oBox.setName(      p_iPage, p_sName );
  },
  setGfx      : function( $super, p_iPage, p_sGfx  ) 
  {
    $super( p_iPage, p_sGfx );
    this.m_oRegister.setGfx( p_iPage, p_sGfx );
    this.m_oBox.setGfx(      p_iPage, p_sGfx );
  },
  setStyle    : function( $super, p_hStyle )
  {
    $super( p_hStyle );
    this.m_oRegister.setStyle(  p_hStyle );
    this.m_oBox.setStyle(       p_hStyle );
  },

  next        : function( $super, p_hStyle )
  {
    $super(  );
    this.m_oRegister.next();
    this.m_oBox.next();
  },
  prev         : function( $super )
  {
    $super( );
    this.m_oRegister.prev();
    this.m_oBox.setprev();
  }

});


/**
 * Creates the tab registers 
 * @class
 * @name TabRegister  
 * @version 1.0
 * @extends TabElement
 * @param {string}  source node or id of the source (html)
 * @param {hash}    style  the style assignments for the tab
 * @param {integer} caller optional parameter, if widget is called from an other widget
 * 
 * @example var myTabRegister = new TabRegister(   "myTab",           
                                    { cssStyle         : 'simple',  
                                      left             : '10px', 
                                      top              : '10px',
                                      width            : "250px",       
                                      height           : "200px",   
                                      selectedColor    : '#d48080', 
                                      regAlign         : "left",   
                                      regPos           : "top", 
                                      regRows          : '1',      
                                      regDistance      : '4px'     
                                    }
                                );
 */
var TabRegister = Class.create( TabElement, 
/**
 * @lends TabRegister.prototype
 */
{
  initialize : function( $super, p_nSource, p_hStyle, p_oCaller )
  {
    $super( p_nSource, p_hStyle, p_oCaller );
  },
  // subfunction from constructor
  initStyle : function( $super, p_hStyle )
  {
    $super( p_hStyle );
    
    // limit register counts
    if ( this.m_hStyle.get( 'regRows' ) > this.m_iCntRegPages )
      this.m_hStyle.set( 'regRows', this.m_iCntRegPages);
    if ( this.m_hStyle.get( 'regRows' ) > 100 ) 
      this.m_hStyle.set( 'regRows', 100); 

    // Define register page colors
    this.m_sRegColTbl = new Array( "", "white", "white", "gray", "black", this.m_hStyle.get('backgroundColor'), this.m_hStyle.get('backgroundColor'));
    // change color if bottom register
    if( this.m_hStyle.get('regPos') == "bottom" )
    {
      this.m_sRegColTbl[2] = "black";
      this.m_sRegColTbl[6] = "gray";
    }

    // color table for register pages (active & non-active)(top+bottom)
    this.m_aRegPageColTbl    = new Array();
    this.m_aRegPageColTbl[0] = new Array( 0, 0, 2, 2, 0, 0 );
    this.m_aRegPageColTbl[1] = new Array( 0, 1, 6, 6, 4, 0 );
    this.m_aRegPageColTbl[2] = new Array( 1, 5, 5, 5, 3, 4 );
    //    These are set at creation time (look further in code...)
    //this.m_aRegPageColTbl[3] = new Array( 2, 2, 2, 2, 2, 2 ); <- non-active
    //this.m_aRegPageColTbl[3] = this.m_aRegPageColTbl[2];      <- active
    
    // Position of GFX and NAME in RegPageTbl
    this.m_aGfxPos  = ( { x: 2, y : 2 } );
    this.m_aNamePos = ( { x: 3, y : 2 } );
  },
  /**
   * @function
   */
   create : function()
   {
     // table over the register rows
     var v_nTable = new Element( "table", { cellSpacing : 0, cellPadding : 0 } );
     v_nTable.setStyle( { width : '100%' } );

     var v_nTR = "";
     var v_nTD = "";
     var v_iCntRows = this.m_hStyle.get( 'regRows' );
     var v_fOffset = ( this.m_iCntRegPages / v_iCntRows );
     
     // build all register rows in a table
     for ( var v_iRow = 1; v_iRow <= v_iCntRows; v_iRow++ )
     {
       // create new register row
       v_iStart = ~~( v_fOffset * (v_iRow-1)) + 1; // start page of register
       v_iEnd   = ~~( v_fOffset * v_iRow);         // end page of register
       v_bActPageInRegister = ( v_iStart <= this.m_iActPage && v_iEnd >= this.m_iActPage ); // flag (is active page in this register row?)
       v_nRegisterRow = this.createRow( v_iStart, v_iEnd, v_bActPageInRegister );

       if ( !v_bActPageInRegister )
       {
         // make overlapping ( go <n> pixels down )
         v_sDistance = ~~(this.m_hStyle.get('regDistance'));
         if ( this.m_hStyle.get('regPos')  == 'bottom' ) 
           v_sDistance *= (-1);
         
         v_nRegisterRow.setStyle( { top      : v_sDistance +'px', 
                                    position :'relative', 
                                    zIndex   : this.m_hStyle.get('regRows') - v_iRow } );

         v_nTR = v_nTable.insertRow( (-1) * (this.m_hStyle.get('regPos') == 'bottom') );
       }
       else // first line (front line)
       {
         v_nRegisterRow.setStyle( { position : 'relative', 
                                    zIndex   : this.m_hStyle.get( 'regRows' ) } );
         
         v_nTR = v_nTable.insertRow( (-1) * (this.m_hStyle.get('regPos') == 'top'  ) );
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
     v_nTable.setStyle( { width : '100%' } );

     // new row in table
     var v_nTR = $(v_nTable.insertRow(0));
     var v_sRegAlign = this.m_hStyle.get('regAlign');
     
     // left filler    
     if ( this.m_iActPage != p_iLeft || v_sRegAlign == 'right' )
         v_nTR.appendChild( this.createFiller( true, p_bActPageInRegister ) ); // true == left filler

     // draw all pages
     for( i = p_iLeft; i <= p_iRight; i++ )
     {
       // td for page
       var v_nTD = new Element( "td" );
       if( this.m_hStyle.get('regPos') == 'bottom' )
         v_nTD.vAlign = "top";
       else
         v_nTD.vAlign = "bottom";
       
       // make the register page        
       v_nRegister = this.createPage( i, p_bActPageInRegister );

       // anker the register page in td of Register
       v_nTD.appendChild( v_nRegister );
       
       // anker td in row of Register
       v_nTR.appendChild( v_nTD );
     }
     
     // right filler (createFiller returns the td node)
     if ( this.m_iActPage != p_iRight || v_sRegAlign == 'left' ) 
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
       
     // stretch  filler?
     if(  (  p_bLeft && this.m_hStyle.get( 'regAlign' ) == 'right' )
       || ( !p_bLeft && this.m_hStyle.get( 'regAlign' ) == 'left'  ) )
       v_nTD.setStyle( { width : "100%" } );

     // bottom or top border
     if ( p_bDrawBorder ) // only in front row of register the border must be visible
     {
       switch( this.m_hStyle.get('regPos') )
       {
         case 'bottom': v_nTD.setStyle( { borderTop    : "1px solid black" } );  break;
         case 'top'   : v_nTD.setStyle( { borderBottom : "1px solid white" } ); break;
       }
     }

     // for compatibility ie 6
     v_nBox = new Element( "div" ).setStyle( {width : "1px"} );
     v_nTD.appendChild( v_nBox );
  
     // return the new filler
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
  createPage : function( p_iPage, p_bCutBorder )
  {
    var v_sSelected = "";
    // Page is the actual one?
    if ( p_iPage == this.m_iActPage )
    {
      v_sSelected = "Selected"; 
      this.m_aRegPageColTbl[3] = this.m_aRegPageColTbl[2]; // no border line
    }
    else // not actual
      this.m_aRegPageColTbl[3] = new Array( 2, 2, 2, 2, 2, 2 ); // a white or black line
 
    // Set the ColorColor:
    this.m_sRegColTbl[5] = this.getColor( p_iPage );   
      
    // generate the table element for the page
    var v_nTable = new Element( "table", { cellSpacing: 0, cellPadding : 0 });
    v_nTable.setStyle({ width : "100%" });  // needed for chrome

    // start and end point of register page (cut the border if page is neighbor of active page
    // and the active page is in same row
    v_iStartColmn = ( p_iPage == this.m_iActPage + 1 && p_bCutBorder ? 2 : 0 );
    v_iEndColmn   = ( p_iPage == this.m_iActPage - 1 && p_bCutBorder ? 3 : 5 );

    // 4 rows (only 3 if the row is not the first in the front)
    for( var v_iRow = 0 ; v_iRow < (p_bCutBorder ? 4 : 3); v_iRow++ )
    {
      // new TR on first child or last
      v_nTR = $(v_nTable.insertRow( (this.m_hStyle.get('regPos') == 'top') * v_iRow ));
        
      for( var v_iClmn = v_iStartColmn; v_iClmn <= v_iEndColmn; v_iClmn++ )
      {
        // new td in tr with correct background color
        var v_nTD  = new Element( "td" ).setStyle( {
                     backgroundColor : this.m_sRegColTbl[ this.m_aRegPageColTbl[v_iRow][v_iClmn] ],
                     paddingLeft     : "1px",
                     paddingTop      : "1px"  } );
        v_nTR.appendChild( v_nTD );

        // gfx node must be filled
        if ( v_iRow == this.m_aGfxPos.y && v_iClmn == this.m_aGfxPos.x && this.m_aRegGfx[p_iPage] ) 
        {
          v_nTD.addClassName( "tabsGfx" + v_sSelected );
          v_nTD.appendChild( new Element( "img", { 'src' : this.m_aRegGfx[p_iPage] +''}  ).setStyle( { border : 'none' } ) );
        }
      //Text node
        else if( v_iRow == this.m_aNamePos.y && v_iClmn == this.m_aNamePos.x ) 
        {
          v_nTD.addClassName( "tabsName" + v_sSelected );
          v_nTD.setStyle( { width : "100%" } );
          v_nTD.appendChild( document.createTextNode( this.m_aRegName[p_iPage] ));
          v_nTable.style.whiteSpace = 'nowrap';
        }
      } //for : all columns
    } // for : all Rows

    // <a> tag over the table    
    v_nA = new Element( "a" );
    v_nA.className = this.m_aRegActive[p_iPage] == 1  ? "tabsName" + v_sSelected : "tabsNameInactive";
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
    // the registers must be refreshed    
    this.redraw();
  }
});


/**
 * Creates the tab box 
 * @class
 * @name TabBox  
 * @version 1.0
 * @class
 * @extends TabElement
 * @param {string}  source node or id of the source (html)
 * @param {hash}    style  the style assignments for the tab
 * @param {integer} caller optional parameter, if widget is called from an other widget
 * 
 * @example var myTabRegister = new TabRegister(   "myTab",           
                                    { cssStyle         : 'simple',  
                                      left             : '10px', 
                                      top              : '10px',
                                      width            : "250px",       
                                      height           : "200px",   
                                      selectedColor    : '#d48080', 
                                      regAlign         : "left",   
                                      regPos           : "top", 
                                      regRows          : '1',      
                                      regDistance      : '4px'     
                                    }
                                );
 */
var TabBox = Class.create( TabElement, 
/**
 * @lends TabBox.prototype
 */
{
  initialize : function( $super, p_nSource, p_hStyle, p_oCaller )
  {
    $super( p_nSource, p_hStyle, p_oCaller );
  },

  initStyle : function ( $super, p_hStyle )
  {
    $super( p_hStyle );
    
    // if master, position is set to none -> no border will be eliminated 
    if ( this.m_bIsMainObj )
      this.m_hStyle.set( regPos, "none" ); 
  },
  create : function(   )
  {
    // box node
    this.m_nBox = new Element( "div" );
    this.m_nBox.setStyle(
      {
        borderRight     : '1px solid black',
        borderLeft      : '1px solid white',
        borderTop       : '1px solid white',
        borderBottom    : '1px solid black',
        backgroundColor : this.getColor( this.m_iActPage ),
        width           : this.m_hStyle.get('width')
      } );
    
    // maybe remove one border side
    switch ( this.m_hStyle.get('regPos') )
    {
      case 'bottom' : this.m_nBox.setStyle( { borderBottom : '' }); break;
      case 'top'    : this.m_nBox.setStyle( { borderTop    : '' }); break;
    }
    
    // inner box for 2nd border column
    var v_nInnerBox = new Element( "div" ).addClassName( "tabContainer" );
    $(v_nInnerBox).setStyle( { height : this.m_hStyle.get('height') } );
    // second line on bottom, if not bottom registers
    if ( this.m_hStyle.get('regPos') != 'bottom' )
      v_nInnerBox.style.borderBottom = '1px solid gray';   
    v_nInnerBox.style.borderRight = '1px solid gray'
    // v_nInnerBox.appendChild( this.m_nSource );
    this.m_nBox.appendChild( v_nInnerBox);

    // set the actual page
    this.set( this.m_iActPage );

    // insert all pages in the 'inner boxes' 
    var v_nAllPageDIV = $$("#" + this.m_sID + " div.tabPage");
    $A( v_nAllPageDIV ).each( function( n ){ v_nInnerBox.appendChild( $(n) ); } );
   
    // return the new node
    return this.m_nBox;
  },
  /**
   * set the page
   * 
   */
  set : function( /** @private */$super, p_iPageNr )
  {
    // set the actPage if possible
    $super( p_iPageNr ); 
    
    // hide all Pages
    var v_nAllPageDIV = $$("#"+this.m_sID + " div.tabPage");
    $A( v_nAllPageDIV ).each( Element.hide );

    // make the active Page visible
    v_nAllPageDIV[this.m_iActPage -1].setStyle( { display : "block" });
    if ( this.element)
      this.element.setStyle( { backgroundColor : this.getColor( this.m_iActPage ) } );
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

//Helper
function linkClick( e )
{
  // do the upper click event (only in ie)
  if( e.findElement("a").click ) 
    e.findElement("a").click();
}

// prototype.extentions
Element.addMethods( {
  replace : function ( p_nElement, p_nNewElement )
  {
    v_nParent = p_nElement.up();
    v_nParent.replaceChild( p_nNewElement, p_nElement );
  }
} );
