// Annotated State of The Union

(function ( Popcorn ) {
  Popcorn.parser( "parseSotu", "JSON", function( data ) {
    
    // declare needed variables
    var retObj = {
          title: "",
          remote: "",
          data: []
        },
        dataObj = data.json.data;
        
    Popcorn.forEach( dataObj, function ( obj, key ) {
    
      obj.target = "transcription";
      
      retObj.data.push({
        "footnote": obj
      });

    });

    return retObj;
  });

})( Popcorn );

(function ( global, doc, $, _, Popcorn, undef ) {
  
  //  Setup _ mixins
  _.trim = jQuery.trim;

  //   DOM Ready
  $(function () {
  
    var $doc = $(doc), 
        $pop = Popcorn("#video"),
        $vid = $("#video"), 
        urls = {
          speech: "http://www.pbs.org/newshour/interactive/speeches/api/4?callback=cb", 
          footnotes: "http://www.pbs.org/newshour/interactive/speeches/api/4/footnotes?callback=cb"
        }, 
        sotuFeed;
    
    //  Setup data property
    $doc.data("footnotes", {} );
    
    //  Decorate UI Panels
    $(".ui-accordion-panel").accordion();
    
    //  Load SOTU data into parser
    $pop.parseSotu("data/sotu-data-draft.json");
    
    //  Listen for annotate events, will ship with id
    $pop.listen( "annotate", function( data ) {
      
      if ( $doc.data("footnotes")[ data.id ] ) {
      
        var notes = $doc.data("footnotes")[ data.id ];
        
        sotuFeed.display( notes );
      }
      
    });
    
    //  Declared above, defined here
    //  sets up app logic    
    sotuFeed = {
      //  Handle output to page
      display: function( notes ) {
        
        var $analysis = $("#analysis"),
            author;

        $analysis.html("<ul></ul>");
        
        _.each( notes, function( data, idx ) {

          author = data.author_info;
          
          //console.log(author, author.full_name, author.bio, author.thumbnail );
          //console.log(data.text);
          
          var $li = $("<li/>").appendTo( "#analysis ul" );
        
          $li.html(

            "<h2> <img src='" + author.thumbnail + "'>" + author.full_name + "</h2>"

            + "<hr>" +

            markdown.toHTML( data.text, "Gruber" )

          );          

        });
      },
          
      //  Wrap a simplified, reusable Ajax call
      request: function( url, callback ) {
        $.ajax({
          url: url, 
          type: "get", 
          dataType: "jsonp", 
          success: function( data ) {
            callback && callback.call( null, data );
          }
        });
      }
    };
    //  Request and cache footnotes
    sotuFeed.request( urls.footnotes, function( data ) {
      
      var footnotes = {}, 
          index;
    
      _.each( data, function( obj, idx ) {
        
        //  Store only comments
        if ( obj.note_type.name === "Comment" ) {
          
          //  Ensure index is a string, use as cache key
          index = ""+obj.index;    
          
          //  If there is no footnote index arracy cache 
          if ( !footnotes[ index ] ) {
            footnotes[ index ] = [];
          }
          
          //  Store in footnote cache arrays by index
          footnotes[ index ].push( obj );
          
        }
      
      });

      //  Enable the video controls 
      $vid.attr( "controls", "controls" );
      
      //  Store footnote cache in a document data property
      $doc.data( "footnotes", footnotes );  
      
    });
    
  });

})( this, this.document, this.jQuery, this._, Popcorn );
