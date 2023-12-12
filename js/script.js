var search, results, allOptions, currentSet = [];
var lastUpdate = "?";

var indexOnDescriptionCheckbox = document.getElementById('indexOnDescriptionCheckbox');
var indexOnTitleCheckbox = document.getElementById('indexOnTitleCheckbox');

var modalTitle = document.getElementById('myModalLabel');
var modalBody = document.getElementById('myModalBody');

var rebuildAndRerunSearch = function() {
  rebuildSearchIndex();
  searchOptions();
};

var docOnload = function(){
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');
  searchInput.value = query;
  searchOptions(query);

  $("#advcheck").prop("checked", false);
//  $("#advcheck").removeAttr("checked");
}

indexOnDescriptionCheckbox.onchange = rebuildAndRerunSearch;
indexOnTitleCheckbox.onchange = rebuildAndRerunSearch;
indexStrategySelect.onchange = rebuildAndRerunSearch;

var rebuildSearchIndex = function() {
  search = new JsSearch.Search('title');

  search.indexStrategy =  eval('new ' + indexStrategySelect.value + '()');
  search.searchIndex = new JsSearch.UnorderedSearchIndex();

  if (indexOnTitleCheckbox.checked) {
    search.addIndex('title');
  }
  if (indexOnDescriptionCheckbox.checked) {
    search.addIndex('description');
  }

  search.addDocuments(allOptions);
};

var indexedOptionsTable = document.getElementById('indexedOptionsTable');
var indexedOptionsTableHeader = document.getElementById('indexedOptionsTableHeader');
var lastUpdateElement = document.getElementById('lastUpdateElement');
var indexedOptionsTBody = indexedOptionsTable.tBodies[0];
var searchInput = document.getElementById('searchInput');
var optionCountBadge = document.getElementById('optionCountBadge');

var updateLastUpdate = function(lastUpdate) {
  lastUpdateElement.innerHTML = 'Last update: '+ lastUpdate;
};

var updateOptionsTable = function(options) {
  indexedOptionsTBody.innerHTML = '';
  currentSet = options;

  var tokens = search.tokenizer.tokenize(searchInput.value);

  for (var i = 0, length = options.length; i < length; i++) {
    var option = options[i];

    var titleColumn = document.createElement('td');
    titleColumn.innerHTML = option.title;

    var descriptionColumn = document.createElement('td');
    descriptionColumn.innerHTML = option.description;
    descriptionColumn.classList.add("phonehide");

    var typeColumn = document.createElement('td');
    typeColumn.innerHTML = option.type;
    typeColumn.classList.add("phonehide");

    var tableRow = document.createElement('tr');

    var att = document.createAttribute("onClick");
    att.value = "expandOption("+i+")";
    tableRow.setAttributeNode(att);

    var att1 = document.createAttribute("class");
    att1.value = "optrow";
    tableRow.setAttributeNode(att1);


    var att2 = document.createAttribute("style");
    att2.value = "overflow-wrap: break-word";
    titleColumn.setAttributeNode(att2);

    tableRow.appendChild(titleColumn);
    tableRow.appendChild(descriptionColumn);
    tableRow.appendChild(typeColumn);

    indexedOptionsTBody.appendChild(tableRow);
  }
};

var expandOption = function(el){

  modalTitle.innerHTML = currentSet[el].title;

  var elDesc = "<h5 style='margin:1em 0 0 0'>Description</h5><div>" + currentSet[el].description + "</div>";
  var elType = "<h5 style='margin:1em 0 0 0'>Type</h5><div>" + currentSet[el].type + "</div>";
  var elNote = ( currentSet[el].note == "" ? "": "<h5 style='margin:1em 0 0 0'>Note</h5><div>" + currentSet[el].note + "</div>");
  var elDefault = "<h5 style='margin:1em 0 0 0'>Default</h5><div><pre style='margin-top:0.5em'>" + currentSet[el].default + "</pre></div>";
  var elExample = ( currentSet[el].example == "" ? "" : "<h5 style='margin:1em 0 0 0'>Example</h5><div><pre style='margin-top:0.5em'>" + currentSet[el].example + "</pre></div>");

  var declared_by_str = currentSet[el].declared_by;

  var elDeclaredBy = "<h5 style='margin:1em 0 0 0'>Declared by</h5><div>" + declared_by_str+ "</div>";
  modalBody.innerHTML = elDesc + elNote + elType + elDefault + elExample + elDeclaredBy;


  $('#myModal').modal('show')
}

var updateOptionCountAndTable = function() {
  updateOptionCount(results.length);

  if (results.length > 0) {
    updateOptionsTable(results);
  } else if (!!searchInput.value) {
    updateOptionsTable([]);
  } else {
    updateOptionCount(allOptions.length);
    updateOptionsTable(allOptions);
  }
};

var setSearchQueryToUrlParam = function(query) {
  const urlParams = new URLSearchParams();
  urlParams.set('query', query);
  const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.replaceState({}, '', newUrl);
};

var searchOptions = function(query) {
  results = search.search(query);
  updateOptionCountAndTable();
};

const SEARCH_INPUT_DEBOUNCE_MS = 100;

let debounceTimer;

searchInput.oninput = function() {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    const query = searchInput.value;
    setSearchQueryToUrlParam(query);
    searchOptions(query);
  }, SEARCH_INPUT_DEBOUNCE_MS);
};

var updateOptionCount = function(numOptions) {
  optionCountBadge.innerText = numOptions + ' options';
};
var hideElement  = function(element) {
  element.className += ' hidden';
};
var showElement = function(element) {
  element.className = element.className.replace(/\s*hidden/, '');
};

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    var json = JSON.parse(xmlhttp.responseText);

    allOptions = json.options;
    lastUpdate = json.last_update;
    updateLastUpdate(lastUpdate);

    updateOptionCount(allOptions.length);

    var loadingProgressBar = document.getElementById('loadingProgressBar');
    hideElement(loadingProgressBar);
    showElement(indexedOptionsTable);
    showElement(indexedOptionsTableHeader);

    rebuildSearchIndex();
    docOnload();
    if(searchInput.value.trim() ==""){
      updateOptionsTable(allOptions);
    }


  }
}
xmlhttp.open('GET', 'data/options.json', true);
xmlhttp.send();
