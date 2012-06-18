define( [
    "use!backbone", 
    "use!handlebars", 
    "text!datum/datum_state_settings.handlebars",
    "datum/DatumState"
], function(
    Backbone, 
    Handlebars, 
    datum_stateTemplate,
    DatumState
    
) {
  var DatumStateEditView = Backbone.View.extend(
  /** @lends DatumStateEditView.prototype */
  {
    /**
     * @class DatumStateEditView
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATUM STATE EDIT init");
    },
    
    events : {
      "blur .datum_state_input" : function() { console.log("in blur: model"); }
    },
    
    model : DatumState,

    template: Handlebars.compile(datum_stateTemplate),
      
    render : function() {
      Utils.debug("DATUM STATE EDIT render");
      
      // Display the DatumStateEditView
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    }
  });

  return DatumStateEditView;
}); 
