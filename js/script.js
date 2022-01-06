var search, results, allOptions = [];
var lastUpdate = "?";

var indexOnDescriptionCheckbox = document.getElementById('indexOnDescriptionCheckbox');
//var indexStrategySelect = document.getElementById('indexStrategySelect');
//var removeStopWordsCheckbox = document.getElementById('removeStopWordsCheckbox');
var indexOnTitleCheckbox = document.getElementById('indexOnTitleCheckbox');
//var useStemmingCheckbox = document.getElementById('useStemmingCheckbox');
//var sanitizerSelect = document.getElementById('sanitizerSelect');
//var tfIdfRankingCheckbox = document.getElementById('tfIdfRankingCheckbox');

var rebuildAndRerunSearch = function() {
  rebuildSearchIndex();
  searchOptions();
};

indexOnDescriptionCheckbox.onchange = rebuildAndRerunSearch;
//indexStrategySelect.onchange = rebuildAndRerunSearch;
//removeStopWordsCheckbox.onchange = rebuildAndRerunSearch;
indexOnTitleCheckbox.onchange = rebuildAndRerunSearch;
//useStemmingCheckbox.onchange = rebuildAndRerunSearch;
//sanitizerSelect.onchange = rebuildAndRerunSearch;
//tfIdfRankingCheckbox.onchange = rebuildAndRerunSearch;

var rebuildSearchIndex = function() {
  search = new JsSearch.Search('description');

  /*
  if (useStemmingCheckbox.checked) {
    search.tokenizer = new JsSearch.StemmingTokenizer(stemmer, search.tokenizer);
  }
  if (removeStopWordsCheckbox.checked) {
    search.tokenizer = new JsSearch.StopWordsTokenizer(search.tokenizer);
  }
  */

  search.indexStrategy =  eval('new ' + indexStrategySelect.value + '()');
  //search.sanitizer =  eval('new ' + sanitizerSelect.value + '()');;

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
var lastUpdateElement = document.getElementById('lastUpdateElement');
var indexedOptionsTBody = indexedOptionsTable.tBodies[0];
var searchInput = document.getElementById('searchInput');
var optionCountBadge = document.getElementById('optionCountBadge');

var updateLastUpdate = function(lastUpdate) {
  lastUpdateElement.innerHTML = 'Last update: '+ lastUpdate;
};

var updateOptionsTable = function(options) {
  indexedOptionsTBody.innerHTML = '';

  var tokens = search.tokenizer.tokenize(searchInput.value);

  for (var i = 0, length = options.length; i < length; i++) {
    var option = options[i];

    var titleColumn = document.createElement('td');
    titleColumn.innerHTML = option.title;

    var descriptionColumn = document.createElement('td');
    descriptionColumn.innerHTML = option.description;

    var typeColumn = document.createElement('td');
    typeColumn.innerHTML = option.type;

    var tableRow = document.createElement('tr');

    var att = document.createAttribute("onClick");
    att.value = "expandOption(this)";
    tableRow.setAttributeNode(att);

    tableRow.appendChild(titleColumn);
    tableRow.appendChild(descriptionColumn);
    tableRow.appendChild(typeColumn);

    indexedOptionsTBody.appendChild(tableRow);
  }
};

var expandOption = function(el){
  console.log("expand unknown element");
  console.log(el);
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

var searchOptions = function() {
  results = search.search(searchInput.value);
  updateOptionCountAndTable();
};

searchInput.oninput = searchOptions;

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

    updateOptionCount(allOptions.length);

    var loadingProgressBar = document.getElementById('loadingProgressBar');
    hideElement(loadingProgressBar);
    showElement(indexedOptionsTable);

    rebuildSearchIndex();
    updateOptionsTable(allOptions);
    updateLastUpdate(lastUpdate);
  }
}
xmlhttp.open('GET', 'data/options.json', true);
xmlhttp.send();
