var HTMLFieldsEnhancer = (function() {
  function htmlMakeThingSpeakFields() {
    $(".select_dataid").each(ttt);

    function ttt() {
      var sel = $(this).attr("default");
      $(this).html(function() {
        return "<div class='form-group'><label>{0}</label>\
        <select class='form-control' id='tsf{0}'>\
        <option></option><option>CO2</option><option>TEMP</option><option>HUM</option><option>PRES</option>\
        <option>ALT</option><option>PM1</option><option>PM25</option><option>PM10</option><option>LUX</option><option>LDR</option>\
        <option>RSSI</option><option>RUNTIME</option><option>VOC_PPM</option><option>VOC_R0PRV</option><option>VOC_R0</option>\
        </select></div>".format($(this).attr("label"))
      });
      $(this).find("select").val(sel);
    }
  }

  function htmlMakeLabelAndInputFields() {
    $(".labelAndInput2").each(function() {
      var base = '<div class="col-xs-3 form-inline">\
        <label for="lbi{0}">%{0}%</label>\
        <input type="text" class="lbi form-control" data-label="{0}" id="{2}{0}" placeholder="{1}">\
        </div>';
      $(this).html(base.format($(this).attr("label"), $(this).attr("placeholder"), $(this).attr("prefix")));
    })
  }

  function init() {
    htmlMakeThingSpeakFields();
    htmlMakeLabelAndInputFields();
  }
  return {
    init:init
  }

})();
