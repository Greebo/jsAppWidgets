// TODO-LIST
// * (richtiges Minimize;) bei Taskbar
// * Schnittstellen für programmieren (evtl. keine hooks)
// * events in die jew.Klasse integrieren (soweit es geht)
// * funktionen zum setzen des titels und statustextes
// * ein weiteres icon in der statusbar /w runde ecken  /size-left
// * funktionen zum befüllen des containers
// * funktionen zum erhalten der ID des jew. icons,fensters,bereichs
// * menu entfernen oder umschreiben
// * toggeln des minimize-icons/maximize-icons
// * kontextmenü bei winpic bzw. titlepic (zuerst in menü: inaktive menüpunkte)
// * taskbar (evtl. nur Einträge in context-menu)
// * funktionen für move und size, maximize,normalize....
// * always top -fenster
// * requester

//desk properties

// global vars
var g_iWinNr     = 0;
var g_aWinWidget = new Array();

//Superclass
var WinElement = Class.create( {
  initialize : function( p_nSource, p_hStyle, p_oCaller )
  {
    // if parent exist, the parent is the master node
    try { 
      this.m_iWinNr        = p_oCaller.m_iWinNr; 
      this.m_bIsMainObject = false; 
        }
    catch (e) { // otherwise this node is the master node
      // write object in global var
      g_aWinWidget[this.m_iWinNr = g_iWinNr++] = this;
      this.m_bIsMainObject = true;
              };
    // Source html code
    this.m_nSource     = $(p_nSource);

    // id of the Source HTML -> will be id of the created element
    this.m_sID   = this.m_nSource.id;
    
    // Style Infos in this.m_hStyle
    this.initStyle( $H(p_hStyle) );

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
  
  initStyle : function( p_hStyle )      
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
                          backgroundColor  : ""                          
                       } );
  
    // override default values with parameter hash   
    this.m_hStyle.update( p_hStyle );
  },
  
  redraw : function()      
  { 
    v_nNewElement = this.create();
    this.element.replace( v_nNewElement );
    this.element = v_nNewElement; 

    if ( this.m_bIsMainObject ) // node is master
    { 
      //  this.m_nSource.replace( this.element );
      this.m_nSource = this.element;

      this.element.id = this.m_sID;
      // replace source html node
      // add class name
      this.element.addClassName( this.m_hStyle.get('cssStyle') );
    }
  }

});


var Win = Class.create( WinElement, {
  initialize : function( $super, p_nSource, p_hStyle, p_oCaller ) 
  {
    $super( p_nSource, p_hStyle, p_oCaller );
  },
  
  create : function()
  {
    v_oWinTitle  = new WinTitle( this.m_nSource, this.m_hStyle, this );
    v_oWinStatus = new WinStatus(  this.m_nSource, this.m_hStyle, this );
    
    v_nDiv = new Element( "div" );
    v_nDiv.setStyle( { top   : this.m_hStyle.get('top'),
                       left  : this.m_hStyle.get('left'),
                       width : this.m_hStyle.get('width') 
                   } );
    
    v_nDivContainer = new Element( "div" );
    v_nDivContainer.setStyle( { height : this.m_hStyle.get('height')
                                
                            } );
 
    v_nDiv.appendChild( v_oWinTitle.element );
    v_nDiv.appendChild( v_nDivContainer );
    v_nDiv.appendChild( v_oWinStatus.element );
    
    return v_nDiv;
  }
});


var WinTitle = Class.create( WinElement, {
  initialize : function( $super, p_nSource, p_hStyle, p_oCaller ) 
  {
    $super( p_nSource, p_hStyle, p_oCaller );
  },
  
  create : function()
  {
    // outer div
    v_nDiv = new Element( 'div' );
    border = "1px solid red";
//    this.node.onmousedown = nothing;

/*
    // div Window Pic 
    if ( this.properties&WIN_TITLEPIC)
    {
      this.picNode = myNode = makeDivNode(this.nr,"WinTitlePic"+this.nr, "TitlePic" );
      this.node.appendChild(this.picNode);
      if (this.properties&WIN_CLOSE)
      {
        this.picNode.ondblclick = winClose;
      }
    }

    // div Text
    if ( this.properties&WIN_TITLETEXT )
    {
      // clone node WITH text (parameter true)
      this.textNode = makeDivNode(this.nr, "WinTitleText"+this.nr, "TitleText" );
      this.node.appendChild(this.textNode);

      // only if moveable show move cursor
      if ( this.properties&WIN_MOVE )
      {
         this.textNode.style.cursor = "move";
         this.textNode.onmousedown = winMoveStart;
      }
      // if maximizeable on dblclick maximize
      if ( this.properties&WIN_MAXIMIZE )
        this.textNode.ondblclick = winMaximize;
      // if this.text == "" -> &nbsp; stay in text
      if ( this.text != "" )
        this.textNode.appendChild(document.createTextNode(this.text));
    }

    // cascading-button
    if ( this.properties&WIN_CASCADE )
    {
      this.cascadeNode = makeDivNode(this.nr, "WinTitleCascade"+this.nr, "Cascade" );
      this.cascadeNode.title = "cascade window";
      this.node.appendChild(this.cascadeNode);
      // the event handler
      this.cascadeNode.onmousedown = winCascade;
    }

    // close-button
    if ( this.properties&WIN_CLOSE )
    {
      this.closeNode = makeDivNode(this.nr, "WinTitleClose"+this.nr, "Close" );
      this.closeNode.title = "close window";
      this.node.appendChild(this.closeNode);
      // the event handler
      this.closeNode.onmouseup = winClose;
    }

*/  
    // return the titlebar node
    return v_nDiv;
  }
});


var WinStatus = Class.create( WinElement, {
  initialize : function( $super, p_nSource, p_hStyle, p_oCaller ) 
  {
    $super( p_nSource, p_hStyle, p_oCaller );
  },
  
  create : function()
  {
    // outer div
    v_nDiv = new Element( 'div');
/*
    // Status-Text
    if ( this.properties&WIN_STATUSTEXT )
    {
      myNode = makeDivNode(this.nr, "WinStatusText"+this.nr, "StatusText" );
      if ( this.text != "" )
        myNode.firstChild.nodeValue = this.text;
      // append node in titlebar
      this.node.appendChild(myNode);
    }

    // Sizebutton
    if ( this.properties&WIN_SIZE )
    {
      myNode = makeDivNode(this.nr, "WinStatusSize"+this.nr, "Size" );
      // event for start moving
      myNode.onmousedown = winSizeStart;
      this.node.appendChild(myNode);
    }
*/
    return v_nDiv;
  }
});

