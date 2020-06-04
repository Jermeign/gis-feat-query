// Declare Global Variables

const manual = document.getElementById('manual-radio');
const file = document.getElementById('upload-radio');
const submit_btn = document.getElementById('submit-btn');
const man_submit_btn = document.getElementById('manual-submit-btn');
const input = document.getElementById('query-file-input');
const sys_owner = document.getElementById('owner-select');
const features = document.getElementById('feature-select');
var mhModalData = []
var latModalData = []
const owners = [{
  "id": "1",
  "name": "Dekalb Co Department of Watershed Management", "layers": [{ "id": "0", "name": "Manholes" }, { "id": "1", "name": "Sewer Treatment Facility" }, { "id": "2", "name": "Lift Stations" }, { "id": "3", "name": "Flow Monitors" }, { "id": "4", "name": "Rain Gauges" }, { "id": "5", "name": "Cleanout" }, { "id": "6", "name": "Air Valves" }, { "id": "7", "name": "Sewer Mains" }, { "id": "8", "name": "Sewer Trunks" }, { "id": "9", "name": "Force Mains" }, { "id": "10", "name": "Laterals" }, { "id": "11", "name": "Sewer Basin" }, { "id": "12", "name": "Sewer Easements" }, { "id": "13", "name": "Sewersheds" }], "query_string": "https://services2.arcgis.com/IxVN2oUE9EYLSnPE/arcgis/rest/services/SewerLayers/FeatureServer/{0}/query?where={1}&outFields=*&f=pjson&token=6IjZZSvXYG8ErM1Sv_76z36BBAptrae7zsT9x1DHR56-x4sn-xmiWtzyBIJZryfz_eQjYBfrfpmjpDOrsTU2DwDu72FsBOmgLOttyCTqmAmbo8Z_tO-FmXeFuYLQHYHzQAogHcUnGo73hEs8yH3XvAwlCL2zzNwF4Ybv54u3OvEK5-Fx-5_PxRFsyx7htYAXCnVaFVi0PB5fK5DMbAJ5xDh3-hcy5YbFW6228lzfym0."
}, { "id": "2", "name": "City of Atlanta", "layers": [{ "id": "0", "name": "Manholes" }, { "id": "1", "name": "Sewer Treatment Facility" }, { "id": "2", "name": "Lift Stations" }, { "id": "3", "name": "Flow Monitors" }, { "id": "4", "name": "Rain Gauges" }, { "id": "5", "name": "Cleanout" }, { "id": "6", "name": "Air Valves" }, { "id": "7", "name": "Sewer Mains" }, { "id": "8", "name": "Sewer Trunks" }, { "id": "9", "name": "Force Mains" }, { "id": "10", "name": "Laterals" }, { "id": "11", "name": "Sewer Basin" }, { "id": "12", "name": "Sewer Easements" }, { "id": "13", "name": "Sewersheds" }], "query_string": "https://services2.arcgis.com/IxVN2oUE9EYLSnPE/arcgis/rest/services/SewerLayers/FeatureServer/{0}/query?where={1}&outFields=*&f=pjson&token=6IjZZSvXYG8ErM1Sv_76z36BBAptrae7zsT9x1DHR56-x4sn-xmiWtzyBIJZryfz_eQjYBfrfpmjpDOrsTU2DwDu72FsBOmgLOttyCTqmAmbo8Z_tO-FmXeFuYLQHYHzQAogHcUnGo73hEs8yH3XvAwlCL2zzNwF4Ybv54u3OvEK5-Fx-5_PxRFsyx7htYAXCnVaFVi0PB5fK5DMbAJ5xDh3-hcy5YbFW6228lzfym0." }]


JSON.parse(JSON.stringify(owners)).forEach(owner => {
  let opt = document.createElement('option')
  opt.setAttribute('value', owner.id)
  opt.text = owner.name
  sys_owner.appendChild(opt);
})

// ESRI ARCGIS Service URL "GET" Function
function getData(api_string) {
  fetch(api_string)
    .then(res => res.json())
    .then(data => {
      switch (mode) {
        case 'manual':
          gisToTable(Array.from(data.features))
          break;
        case 'file':
          gisToTable(Array.from(data.features))
          break;
        case 'mh-derived-from-tbl':
          gisToJSON(Array.from(data.features), mode = 'mh-derived-from-tbl')
          break;
        case 'lat-derived-from-tbl':
          console.log("Hello World")
          gisToJSON(Array.from(data.features), mode = 'lat-derived-from-tbl')
      }
    })
}

// Convert API Data to HTML Table
function gisToTable(arr) {
  // Empty Div Container if Table Already Exists
  if (document.getElementById('results-div')) {
    document.getElementById('results-div').innerHTML = '';
  }

  // Section Header

  title = document.createElement('h2')
  title.innerText = 'Query Result'
  document.getElementById('results-div').appendChild(title);

  // Create New Table
  tbl = document.createElement('table');
  tbl.classList.add('display', 'table');
  tbl.id = 'example';
  header = document.createElement('thead');
  header.innerHTML = `
    <tr>
      <th>OBJECTID</th>
      <th>USMH</th>
      <th>DSMH</th>
      <th>Material</th>
      <th>Diameter</th>
      <th>Laterals</th>
      <th>Length [LF]</th>
    </tr>
  `;
  tbl.appendChild(header);
  body = document.createElement('tbody');
  tbl.appendChild(body);
  let manholes = new Set();

  // GET Lateral Instances for Each Pipe Segment
  let pipes = arr.map(x => x.attributes.ID);


  arr.forEach(row => {
    manholes.add(row.attributes.UPSTREAM_MH)
    manholes.add(row.attributes.DOWNSTREAM_MH)

    body.innerHTML += `
      <tr>
        <td>${row.attributes.OBJECTID}</td>
        <td data-obj="${row.attributes.UPSTREAM_MH}">${row.attributes.UPSTREAM_MH}<a href="#" class="mh-info-btn" data-toggle="modal" data-target="#mh-details-modal"  onclick="showMHData(this)"><span class="badge badge-pill badge-info mh-badge">info</span></a></td>
        <td data-obj="${row.attributes.DOWNSTREAM_MH}">${row.attributes.DOWNSTREAM_MH}<a href="#" class="mh-info-btn" data-toggle="modal" data-target="#mh-details-modal" onclick="showMHData(this)"><span class="badge badge-pill badge-info mh-badge">info</span></a></td>
        <td>${row.attributes.PIPE_MATERIAL}</td>
        <td>${row.attributes.DIAMETER_HEIGHT}</td>
        <td>${getLateralCount(row.attributes.ID)}</td>
        <td>${row.attributes.Shape__Length.toFixed(2)}</td>
      </tr>
    `;
  })


  document.getElementById('results-div').appendChild(tbl);

  $(document).ready(function () {
    $('#example').DataTable();
  })
  apiQueryStringBuilder(arrayToQueryString('PIPE_ID in (', Array.from(pipes)), mode = 'lat-derived-from-tbl');
  apiQueryStringBuilder(arrayToQueryString('ID in (', Array.from(manholes)), mode = 'mh-derived-from-tbl');
}

function getLateralCount(id) {
  if (latModalData.length > 0) {
    var arr = latModalData.filter(x => x.attributes.PIPE_ID == id)
    console.log(arr)
    return arr.length
  }
}

// GIS to JSON
function gisToJSON(arr, mode) {
  if (mode == 'mh-derived-from-tbl') {
    arr.forEach(row => {
      mhModalData.push(row.attributes)
    })
  } else {
    arr.forEach(row => {
      latModalData.push(row.attributes)
    })
  }
}

// Get MH Info from API
function showMHData(elem) {
  let mh = elem.parentElement.dataset.obj;
  let inst = mhModalData.filter(item => item.ID == mh)[0];
  console.log(inst);
  let d = new Date(parseInt(inst.created_date));
  let created_date = d.getFullYear() + '-' + padZeros((d.getMonth() + 1), 2) + '-' + padZeros(d.getDate(), 2);
  d = new Date(parseInt(inst.last_edited_date));
  let last_edited_date = d.getFullYear() + '-' + padZeros((d.getMonth() + 1), 2) + '-' + padZeros(d.getDate(), 2);

  $("#mh-details-modal").on("show.bs.modal", function (e) {
    $("#modal-title").text(`Manhole - ${inst.ID}`)
    $("#modal-objid").text(inst.OBJECTID)
    $("#modal-id").text(inst.ID)
    $("#modal-addr").text(inst.ADDRESS)
    $("#modal-depth").text(inst.DEPTH)
    $("#modal-inst-date").text(inst.INSTALL_DATE)
    $("#modal-east").text(inst.EASTING)
    $("#modal-north").text(inst.NORTHING)
    $("#modal-surface").text(inst.SURFACE_TYPE)
    $("#modal-grnd-elev").text(inst.GROUND_ELEVATION)
    $("#modal-rim-elev").text(inst.RIM_ELEVATION)
    $("#modal-diameter").text(inst.MH_DIAMETER)
    $("#modal-created-by").text(inst.created_user)
    $("#modal-created-date").text(created_date)
    $("#modal-last-edited-by").text(inst.last_edited_user)
    $("#modal-last-edited-date").text(last_edited_date)
    $("#modal-remarks").text(inst.REMARKS)
  });


}

function padZeros(num, size) {
  var s = num + "";
  while (s.length < size) {
    s = "0" + s;
  }

  return s;
}


sys_owner.addEventListener('change', () => {
  index = sys_owner.options[sys_owner.selectedIndex].value;
  owner = owners.filter(x => x.id = index)[0]

  if (features.children.length > 0) {
    features.innerHTML = '<option value="-1">-- Select One --</option>';
  }
  owner.layers.forEach(layer => {
    opt = document.createElement('option')
    opt.setAttribute('value', layer.id)
    opt.text = layer.name;
    features.appendChild(opt);
  })
});

features.addEventListener('change', () => {
  if (features.options[features.selectedIndex].value > -1 && manual.checked) {
    document.getElementById('manual-input-textarea').disabled = false;
  } else {
    document.getElementById('manual-input-textarea').disabled = true;
  }
});

function apiQueryStringBuilder() {
  var params = '';

  switch (mode) {
    case 'manual':
      owner = owners.filter(x => x.id = arguments[0])[0];
      params = encodeURIComponent(arguments[2]);
      getData(owner.query_string.insertParams(arguments[1], params), mode = 'manual')
      break;

    case 'file':
      break;

    case 'mh-derived-from-tbl':
      owner = owners[0];
      params = encodeURIComponent(arguments[0])
      getData(owner.query_string.insertParams(0, params), mode = 'mh-derived-from-tbl')
      break;

    case 'lat-derived-from-tbl':
      owner = owners[0];
      params = encodeURIComponent(arguments[0])
      getData(owner.query_string.insertParams(10, params), mode = 'lat-derived-from-tbl')
  }


}

String.prototype.insertParams = function () {
  str = this;
  for (arg in arguments) {
    str = str.replace("{" + arg + "}", arguments[arg])
  }
  return str
}

manual.addEventListener('click', () => {
  if (manual.checked) {
    // document.getElementById('query-file-input').disabled = true;
    // document.getElementById('file-input-label').disabled = true;
    // document.getElementById('input-headers-sel').disabled = true;
    if (features.options[features.selectedIndex].value > -1) {
      document.getElementById('manual-input-textarea').disabled = false;
    }
    // man_submit_btn.disabled = false;
    // submit_btn.disabled = true;
    $('#manual-input').show();
    $('#manual-submit-btn').show();
    $('#file-input').hide();
    $('#input-headers-group').hide();
    $('#submit-btn').hide();
  }
});

file.addEventListener('click', () => {
  if (file.checked) {
    document.getElementById('query-file-input').disabled = false;
    // document.getElementById('file-input-label').disabled = false;
    // document.getElementById('input-headers-sel').disabled = false;
    // document.getElementById('manual-input-textarea').disabled = true;
    // man_submit_btn.disabled = true;
    submit_btn.disabled = false;
    $('#file-input').show();
    $('#input-headers-group').show();
    $('#manual-input').hide();
    $('#manual-submit-btn').hide();
  }
})

document.getElementById('query-file-input').addEventListener('change', () => {
  document.getElementById('selected-file').innerText = input.files[0].name;
  if (input.files[0].type == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    document.getElementById('selected-file-valid').innerText = 'File type validated successfully.'
    document.getElementById('selected-file-valid').style.color = 'forestgreen';
    submit_btn.disabled = false;
  } else {
    document.getElementById('selected-file-valid').innerText = 'Invalid file type.';
    document.getElementById('selected-file-valid').style.color = 'crimson';
    submit_btn.disabled = true;
  }
})

man_submit_btn.addEventListener('click', (e) => {
  e.preventDefault()
  var str = document.getElementById('manual-input-textarea').value;

  if (str.length > 0) {
    owner_sel = sys_owner.options[sys_owner.selectedIndex].value;
    feat_sel = features.options[features.selectedIndex].value;
    apiQueryStringBuilder(owner_sel, feat_sel, str, mode = 'manual');
  }
  mhModalData = [];
  latModalData = [];
})


submit_btn.addEventListener('click', (e) => {
  e.preventDefault()
  if (input.files.length > 0) {
    console.log(input.files)

    $.ajax({
      // Your server script to process the upload
      url: 'https://127.0.0.1:5500/data/uploads',
      type: 'GET',
      headers: { 'Access-Control-Allow-Origin': '*' },
      // Form Data
      data: new FormData($('form')[0]),

      // Tell jQuery not to process data or content-type ** MUST INCLUDE **
      cache: false,
      contentType: false,
      processData: false,

      // Custom XMLHttpRequest
      xhr: function () {
        var myXhr = $.ajaxSettings.xhr();
        if (myXhr.upload) {
          // For handling the progress of the upload
          myXhr.upload.addEventListener('progress', function (e) {
            if (e.lengthComputable) {
              $('progress').attr({
                value: e.loaded,
                max: e.total,
              });
            }
          }, false);
        }
        return myXhr;
      }
    });
  }

})