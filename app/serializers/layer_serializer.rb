class LayerSerializer < ActiveModel::Serializer
  attributes :id, :name, :description, :created_at, :updated_at, :bbox, :maps_count, :rectified_maps_count, :is_visible, :source_uri, :rectified_percent
  
  link(:self) {   api_v1_layer_url(object) }

  link(:kml){     layer_url(:id => object, :format => :kml)}
  link(:tiles) { "http://warper.wmflabs.org/layers/tile/#{object}/{z}/{x}/{y}.png" }
  link(:wms) {    wms_layer_url(:id=>object, :request => "GetCapabilities", :service => "WMS", :version => "1.1.1") }
  
 
end


