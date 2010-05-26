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
    v_nOuter = new Element('div');
    
    v_nDiv = new Element( 'div' ).addClassName('winTitle');
    v_nOuter.appendChild( v_nDiv );
    
    // title pic
    v_nPic = new Element( 'div' ).addClassName( "winTitlePic" );
    v_nDiv.appendChild( v_nPic );
/*    if (this.properties&WIN_CLOSE)
    {
       this.picNode.ondblclick = winClose;
    }
*/    
    
    // clone node WITH text (parameter true)
    v_nText = new Element('div').addClassName('winTitleText');
    v_nDiv.appendChild( v_nText );

    // only if moveable show move cursor
//    if ( this.properties&WIN_MOVE )
    {
       v_nText.style.cursor = "move";
//       this.textNode.onmousedown = winMoveStart;
    }
       // if maximizeable on dblclick maximize
//       if ( this.properties&WIN_MAXIMIZE )
//    v_nText.ondblclick = winMaximize;
       // if this.text == "" -> &nbsp; stay in text
  //     if ( this.text != "" )
    v_nText.appendChild(document.createTextNode("my Window"));
   
    
    // close
    v_nClose = new Element( 'div' ).addClassName( "winClose" );
    v_nClose.title = "close window";
    v_nDiv.appendChild( v_nClose );
    // the event handler
//    this.closeNode.onmouseup = winClose;

    // return the titlebar node
    return v_nOuter;
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
    v_nOuter = new Element( 'div' );
    
    v_nDiv = new Element( 'div' ).addClassName('winStatus');
    v_nOuter.appendChild(v_nDiv);
    
    v_nText = new Element( 'div' ).addClassName('winStatusText'); 

    // append node in titlebar
    v_nDiv.appendChild(v_nText);
    
    v_nSize = new Element('div').addClassName( 'winSize' );
    // event for start moving
//    v_nSize.onmousedown = winSizeStart;
    v_nDiv.appendChild( v_nSize );


    return v_nOuter;
  }
});

