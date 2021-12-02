var annotatemap;
var annotate_wmslayer;
var annotations_layer;
var maxOpacity = 1;
var minOpacity = 0.1;
var selectAnnoId = "";


function annotateinit() {
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
    OpenLayers.Util.onImageLoadErrorColor = "transparent";
    var options_warped = {
        projection: new OpenLayers.Projection("EPSG:900913"),
        displayProjection: new OpenLayers.Projection("EPSG:4326"),
        units: "m",
        numZoomLevels: 20,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(-20037508, -20037508,
            20037508, 20037508.34),
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.LayerSwitcher(),
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.PanZoomBar()
        ]
    };

    annotatemap = new OpenLayers.Map('annotatemap', options_warped);
    // create OSM layer
    mapnik4 = mapnik.clone();
    annotatemap.addLayer(mapnik4);

    for (var i = 0; i < layers_array.length; i++) {
      annotatemap.addLayer(get_map_layer(layers_array[i]));
    }

    var warped_wms_url = warpedwms_url;
    
    if (use_tiles === true){
      annotate_wmslayer =  new OpenLayers.Layer.TMS(I18n['warped']['warped_map'], warpedtiles_url, {
        type: 'png',
        getURL: osm_getTileURL,
        displayOutsideMaxExtent: true,
        transitionEffect: 'resize'
      });
    }else{
      annotate_wmslayer = new OpenLayers.Layer.WMS(I18n['warped']['warped_map'],
        warped_wms_url, {
            format: 'image/png',
            status: 'warped'
        }, {
            TRANSPARENT: 'true',
            reproject: 'true',
            transitionEffect: null
        }, {
            gutter: 15,
            buffer: 0
        }, {
            projection: "epsg:4326",
            units: "m"
        }
      );
    }
    var opacity = .7;
    annotate_wmslayer.setOpacity(opacity);
    annotate_wmslayer.setIsBaseLayer(false);
    annotatemap.addLayer(annotate_wmslayer);

    //TODO update this map on warp / clip etc

    clipmap_bounds_merc = warped_bounds.transform(annotatemap.displayProjection, annotatemap.projection);

    if (mask_geojson) {
      var vector = new OpenLayers.Layer.Vector("GeoJSON", {
        projection: "EPSG:4326"
      });
      var gformat = new OpenLayers.Format.GeoJSON();
      vector.addFeatures(gformat.read(mask_geojson));
      annotatemap.zoomToExtent(vector.getDataExtent());
    } else {
      annotatemap.zoomToExtent(clipmap_bounds_merc);
    }

    //set up slider
    jQuery("#slider").slider({
        value: 100 * opacity,
        range: "min",
        slide: function(e, ui) {
            annotate_wmslayer.setOpacity(ui.value / 100);
            OpenLayers.Util.getElement('opacity').value = ui.value;
        }
    });

    var active_style = OpenLayers.Util.extend({},
      OpenLayers.Feature.Vector.style['default']);
      active_style.graphicOpacity = 1;
      active_style.graphicWidth = 20;
      active_style.graphicHeight = 34;
      active_style.graphicXOffset = -12 ;
      active_style.graphicYOffset = -34  ;
      active_style.externalGraphic = icon_imgPath + "AQUA_add.png";

    active_layer = new OpenLayers.Layer.Vector("active", {visibility: true, style: active_style});
    active_layer.displayInLayerSwitcher = false;
    active_layer.styleMap.styles.temporary.defaultStyle.strokeWidth = 0;
    active_layer.styleMap.styles.temporary.defaultStyle.pointRadius = 0;

    annotatemap.addLayer(active_layer);

    var annotations_style = OpenLayers.Util.extend({},
      OpenLayers.Feature.Vector.style['default']);
    annotations_style.graphicOpacity = 0.6;
    annotations_style.graphicWidth = 20 / 1.2;
    annotations_style.graphicHeight = 34 / 1.2;
    annotations_style.graphicXOffset = -12 / 1.2 ;
    annotations_style.graphicYOffset = -34 / 1.2 ;
    annotations_style.externalGraphic = icon_imgPath + "AQUA.png";

    var select_style = OpenLayers.Util.extend({},
      OpenLayers.Feature.Vector.style['select']);
    select_style.graphicOpacity = 1;
    select_style.graphicWidth = 20 ;
    select_style.graphicHeight = 34 ;
    select_style.graphicXOffset = -12 ;
    select_style.graphicYOffset = -34  ;

    var annotations_styleMap = new OpenLayers.StyleMap({
      'default': annotations_style,
      'select': select_style
    });

    annotations_layer = new OpenLayers.Layer.Vector("Annotations", {visibility: true, styleMap: annotations_styleMap});
    annotations_layer.displayInLayerSwitcher = true;

    annotatemap.addLayer(annotations_layer);

    annotations_layer.events.register('featuresadded', null, function (e) {
      if (selectAnnoId != ""){
        selectAnnotation(selectAnnoId);
        selectAnnoId = "";
      }
    });

    var panel = new OpenLayers.Control.Panel( {displayClass: 'annotationPanel'} );
    
    var addFeature = new OpenLayers.Control.DrawFeature(active_layer, OpenLayers.Handler.Point,
      {displayClass: 'olControlDrawFeaturePoint', title: "add annotation", handlerOptions: {style: active_style}});
      addFeature.featureAdded = function(feature) {
        addNewAnnotation(feature);
      };


    //form listen and submit
    jQuery("#new-annotation form").submit(
      function(event){
        event.preventDefault();
  
        if (jQuery("#geom-input").val().length > 1){

          var url = annotations_url;
          var body = jQuery("#body-input").val();
          var geom = jQuery("#geom-input").val();

          var request = jQuery.ajax({
            type: "POST",
            url: url,
            data: {map_id: map_id, body: body, geom: geom}}
            ).done(function( data) {
              active_layer.destroyFeatures();
              loadAnnotations();
              selectAnnoId = data.data.id;
              
              //reload annotations and/or
              //show the selected annotation
            }).fail(function() {
              console.log("fail")
          });

        }
      }
    );

    //load annotations
    loadAnnotations();

    selectControl = new OpenLayers.Control.SelectFeature(annotations_layer, 
      {displayClass: 'olControlNavigation', title: "Select", hover:false, clickout: false,
      onSelect:   function(feature) { showAnnotation(feature);}, 
      onUnselect: function() { annotations_layer.redraw();}
    });

    panel.addControls([addFeature, selectControl])
    annotatemap.addControl(panel)

    selectControl.activate();

    function showAnnotation(feature){
      jQuery("#show-annotation h2").text("Annotation #"+feature.data.id);
      jQuery("#show-annotation .annotation-body p").text(feature.data.body);
      jQuery("#show-annotation #user-details span#created-by").text("Created by "+feature.data.user.login );
      jQuery("#show-annotation #user-details li abbr").attr("title", feature.data.created_at)
      jQuery("#show-annotation #user-details span#created-ago").attr("title", feature.data.created_at)
      jQuery("#show-annotation #user-details span#created-ago").text(feature.data.created_ago + " ago")

      jQuery("#intro-annotation").hide();
      jQuery("#show-annotation").show();

      annotations_layer.redraw();
    }


    addFeature.events.register("activate", this, function() {
      jQuery("#new-annotation").show();
      jQuery("#show-annotation").hide();
      jQuery("#intro-annotation").hide();
     
      active_layer.setVisibility(true);
      selectControl.unselectAll();
    });

    addFeature.events.register("deactivate", this, function() {
      jQuery("#new-annotation").hide();
      jQuery("#intro-annotation").show();
      active_layer.setVisibility(false);
      selectControl.activate();
    });

    function selectAnnotation(annotation_id){

      var featureToShow;
      for (var a=0;a<annotations_layer.features.length;a++){
        if (annotations_layer.features[a].data.id == annotation_id) {
          featureToShow = annotations_layer.features[a];
        //  break;
        }
      }
      if (featureToShow){
        selectControl.activate();
        addFeature.deactivate();
        selectControl.select(featureToShow);
        showAnnotation(featureToShow)
      }

    }
  
    
}


function loadAnnotations(){
  //may want to delete current features here
  if (annotations_layer.features.length  > 0){
    annotations_layer.destroyFeatures();
  }
  var request = jQuery.ajax({
    type: "GET",
    url: annotations_url,
    format: "json",
    data: {map_id: map_id, format: "json"}}
    ).done(function( dataobj) {
      data = dataobj.data;

      if (data.length > 0){
        var features = []
        for (var a=0;a<data.length;a++){
          var format = new OpenLayers.Format.WKT({'internalProjection': annotatemap.projection, 'externalProjection': annotatemap.displayProjection});
          features[a] = format.read(data[a].attributes.geom);
          features[a].data = data[a].attributes;
          features[a].data.id = data[a].id;
        }
        annotations_layer.addFeatures(features);
      }
  

    }).fail(function() {
      console.log("fail")
  });

};


function addNewAnnotation(feat){
  if (feat.layer.features.length > 1) {
    var to_destroy = new Array();
    for (var a = 0; a < feat.layer.features.length; a++) {
      if (feat.layer.features[a] != feat) {
        to_destroy.push(feat.layer.features[a]);
      }
    }
    feat.layer.destroyFeatures(to_destroy);
  } 
  var latlon =  new OpenLayers.LonLat(feat.geometry.x, feat.geometry.y).transform(annotatemap.projection, annotatemap.displayProjection);
  jQuery("#geom-input").val("POINT("+ latlon.lon + " "+ latlon.lat + ")")
}

function get_map_layer(layerid) {
    var newlayer_url = layer_baseurl + "/" + layerid;
    var map_layer = new OpenLayers.Layer.WMS(I18n['warped']['warped_layer']+" " + layerid,
        newlayer_url, {
            format: 'image/png'
        }, {
            TRANSPARENT: 'true',
            reproject: 'true'
        }, {
            gutter: 15,
            buffer: 0
        }, {
            projection: "epsg:4326",
            units: "m"
        }
    );
    map_layer.setIsBaseLayer(false);
    map_layer.visibility = false;

    return map_layer;
}