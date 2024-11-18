
/***********************************************
 * MARKDOWN Parser for Builtins
 */

const TAGS = {
  '': ['<em>','</em>'],
  _: ['<strong>','</strong>'],
  '*': ['<strong>','</strong>'],
  '~': ['<s>','</s>'],
  '\n': ['<br />'],
  ' ': ['<br />'],
  '-': ['<hr />']
};

/** Outdent a string based on the first indented line's leading whitespace
 *	@private
 */
function outdent(str) {
  return str.replace(RegExp('^'+(str.match(/^(\t| )+/) || '')[0], 'gm'), '');
}

/** Encode special attribute characters to HTML entities in a String.
 *	@private
 */
function encodeAttr(str) {
  return (str+'').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Parse Markdown into an HTML String. */
function parseMD(md, prevLinks) {
  let tokenizer = /((?:^|\n+)(?:\n---+|\* \*(?: \*)+)\n)|(?:^``` *(\w*)\n([\s\S]*?)\n```$)|((?:(?:^|\n+)(?:\t|  {2,}).+)+\n*)|((?:(?:^|\n)([>*+-]|\d+\.)\s+.*)+)|(?:!\[([^\]]*?)\]\(([^)]+?)\))|(\[)|(\](?:\(([^)]+?)\))?)|(?:(?:^|\n+)([^\s].*)\n(-{3,}|={3,})(?:\n+|$))|(?:(?:^|\n+)(#{1,6})\s*(.+)(?:\n+|$))|(?:`([^`].*?)`)|(  \n\n*|\n{2,}|__|\*\*|[_*]|~~)/gm,
    context = [],
    out = '',
    links = prevLinks || {},
    last = 0,
    chunk, prev, token, inner, t;

  function tag(token) {
    let desc = TAGS[token[1] || ''];
    let end = context[context.length-1] == token;
    if (!desc) return token;
    if (!desc[1]) return desc[0];
    if (end) context.pop();
    else context.push(token);
    return desc[end|0];
  }

  function flush() {
    let str = '';
    while (context.length) str += tag(context[context.length-1]);
    return str;
  }

  md = md.replace(/^\[(.+?)\]:\s*(.+)$/gm, (s, name, url) => {
    links[name.toLowerCase()] = url;
    return '';
  }).replace(/^\n+|\n+$/g, '');

  while ( (token=tokenizer.exec(md)) ) {
    prev = md.substring(last, token.index);
    last = tokenizer.lastIndex;
    chunk = token[0];
    if (prev.match(/[^\\](\\\\)*\\$/)) {
      // escaped
    }
    // Code/Indent blocks:
    else if (t = (token[3] || token[4])) {
      chunk = '<pre class="code '+(token[4]?'poetry':token[2].toLowerCase())+'"><code'+(token[2] ? ` class="language-${token[2].toLowerCase()}"` : '')+'>'+outdent(encodeAttr(t).replace(/^\n+|\n+$/g, ''))+'</code></pre>';
    }
    // > Quotes, -* lists:
    else if (t = token[6]) {
      if (t.match(/\./)) {
        token[5] = token[5].replace(/^\d+/gm, '');
      }
      inner = parse(outdent(token[5].replace(/^\s*[>*+.-]/gm, '')));
      if (t=='>') t = 'blockquote';
      else {
        t = t.match(/\./) ? 'ol' : 'ul';
        inner = inner.replace(/^(.*)(\n|$)/gm, '<li>$1</li>');
      }
      chunk = '<'+t+'>' + inner + '</'+t+'>';
    }
    // Images:
    else if (token[8]) {
      chunk = `<img src="${encodeAttr(token[8])}" alt="${encodeAttr(token[7])}">`;
    }
    // Links:
    else if (token[10]) {
      out = out.replace('<a>', `<a href="${encodeAttr(token[11] || links[prev.toLowerCase()])}">`);
      chunk = flush() + '</a>';
    }
    else if (token[9]) {
      chunk = '<a>';
    }
    // Headings:
    else if (token[12] || token[14]) {
      t = 'h' + (token[14] ? token[14].length : (token[13]>'=' ? 1 : 2));
      chunk = '<'+t+'>' + parse(token[12] || token[15], links) + '</'+t+'>';
    }
    // `code`:
    else if (token[16]) {
      chunk = '<code>'+encodeAttr(token[16])+'</code>';
    }
    // Inline formatting: *em*, **strong** & friends
    else if (token[17] || token[1]) {
      chunk = tag(token[17] || '--');
    }
    out += prev;
    out += chunk;
  }

  return (out + md.substring(last) + flush()).replace(/^\n+|\n+$/g, '');
}


/*************************
 * END MARKDOWN PARSER
  */


var search, results, allOptions, currentSet = [];
var lastUpdate = "?";

const useMarkdownParserEl = document.getElementById('useMarkdownParser');
if (useMarkdownParserEl) {
  var useMarkdownParser = useMarkdownParserEl.value
}

var indexOnDescriptionCheckbox = document.getElementById('indexOnDescriptionCheckbox');
var indexOnTitleCheckbox = document.getElementById('indexOnTitleCheckbox');

var modalTitle = document.getElementById('myModalLabel');
var modalBody = document.getElementById('myModalBody');

var rebuildAndRerunSearch = function() {
  rebuildSearchIndex();
  searchOptions('');
};





var docOnload = function(){

  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query') ?? '';

  searchInput.value = query;
  searchOptions(query);

  $("#advcheck").prop("checked", false);
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
var releaseSelect = document.getElementById('releaseSelect');
var optionCountBadge = document.getElementById('optionCountBadge');

var updateLastUpdate = function(lastUpdate) {
  lastUpdateElement.textContent = 'Last update: '+ lastUpdate;
};

var updateOptionsTable = function(options) {
  indexedOptionsTBody.innerHTML = '';
  currentSet = options;

  var tokens = search.tokenizer.tokenize(searchInput.value);

  for (var i = 0, length = options.length; i < length; i++) {
    var option = options[i];

    var titleColumn = document.createElement('td');
    titleColumn.textContent = option.title;

    var descriptionColumn = document.createElement('td');
    descriptionColumn.textContent = option.description;
    descriptionColumn.classList.add("phonehide");

    var typeColumn = document.createElement('td');
    typeColumn.textContent = option.type;
    typeColumn.classList.add("phonehide");

    var tableRow = document.createElement('tr');

    var att = document.createAttribute("onClick");

    if(useMarkdownParser ==="true") {
      att.value = "expandOptionMD("+i+")";
    }
    else{
      att.value = "expandOption("+i+")";
    }

    tableRow.setAttributeNode(att);

    var att1 = document.createAttribute("class");
    att1.value = "optrow";
    tableRow.setAttributeNode(att1);

    var att2 = document.createAttribute("tabindex");
    att2.value = "0";
    tableRow.setAttributeNode(att2);

    tableRow.onkeydown = function(e) {
      if (e.keyCode == 13) {
        tableRow.click();
      };
    };

    var att3 = document.createAttribute("style");
    att3.value = "overflow-wrap: break-word";
    titleColumn.setAttributeNode(att3);

    tableRow.appendChild(titleColumn);
    tableRow.appendChild(descriptionColumn);
    tableRow.appendChild(typeColumn);

    indexedOptionsTBody.appendChild(tableRow);
  }
};











function parseDescription(text){

  text = text.replace(/<https(\s*([^>]*))/gi ,'<a href="https$1">&lt;https$1</a>');
  text = text.replace(/\[\]\(#opt-(\s*([^)]*))/gi ,'<strong>$1</strong>').replace(/\)/gi,'');
  //[](#opt-wayland.windowManager.hyprland.plugins)
  text = text.replace(/\{var\}(\s*([^\n]*))/gi ,'<strong>$1</strong>').replace(/`/gi,'')
  text = text.replace(/:::\ \{\.note\}(\s*([^:::]*))/gi ,'<div class="alert alert-info" role="alert">$1</div>').replace(/:::/,'').replace(/\n/g, '<br />')
  return text;
}

var expandOptionMD = function(el){

  modalTitle.innerHTML = currentSet[el].title;

  let dhtml = parseMD(currentSet[el].doc);
  var elDesc = "<h5 style='margin:1em 0 0 0'>Description</h5><div>" + dhtml  + "</div>";
  var elArgs = "<h5 style='margin:1em 0 0 0'>Args</h5><div>" + currentSet[el].args.join(', ') + "</div>";
  //  var elNote = ( currentSet[el].note == "" ? "": "<h5 style='margin:1em 0 0 0'>Note</h5><div>" + currentSet[el].note + "</div>");
  //  var elDefault = "<h5 style='margin:1em 0 0 0'>Default</h5><div><pre style='margin-top:0.5em'>" + currentSet[el].default + "</pre></div>";
  //  var elExample = ( currentSet[el].example == "" ? "" : "<h5 style='margin:1em 0 0 0'>Example</h5><div><pre style='margin-top:0.5em'>" + currentSet[el].example + "</pre></div>");
  //
  //  var declared_by_str = currentSet[el].declared_by;
  //
  //  var elDeclaredBy = "<h5 style='margin:1em 0 0 0'>Declared by</h5><div>" + declared_by_str+ "</div>";
  //  modalBody.innerHTML = elDesc + elNote + elType + elDefault + elExample + elDeclaredBy;
  modalBody.innerHTML = elDesc + elArgs;

  $('#myModal').modal('show')
}

var expandOption = function(el){

  modalTitle.textContent = currentSet[el].title;

  //console.log(currentSet[el].description.replace(/:::\ \{\.note\}(\s*([^:::]*))/gi ,'<div class="alert alert-info" role="alert">$1</div>').replace(/:::/,''));

  var elDesc = "<h5 style='margin:1em 0 0 0'>Description</h5><div>" + parseDescription(currentSet[el].description) + "</div>";
  var elType = "<h5 style='margin:1em 0 0 0'>Type</h5><div>" + currentSet[el].type + "</div>";
  //var elNote = ( currentSet[el].note == "" ? "": "<h5 style='margin:1em 0 0 0'>Note</h5><div>" + currentSet[el].note + "</div>");
  var elDefault = "<h5 style='margin:1em 0 0 0'>Default</h5><div><pre style='margin-top:0.5em'>" + currentSet[el].default + "</pre></div>";
  var elExample = ( currentSet[el].example == "" ? "" : "<h5 style='margin:1em 0 0 0'>Example</h5><div><pre style='margin-top:0.5em'>" + currentSet[el].example + "</pre></div>");

  //var declared_by_str = currentSet[el].declarations[0].name;
  //console.log(currentSet[el].declarations[0].name);
  var declared_by_str;
  if(currentSet[el].declarations && currentSet[el].declarations.length >0 && currentSet[el].declarations[0].name){
    declared_by_str = '<a href="'+currentSet[el].declarations[0].url+'">'+currentSet[el].declarations[0].name.replace(/</,'&lt;').replace(/>/,'&gt;')+'</a>';
  }

  var elDeclaredBy = "<h5 style='margin:1em 0 0 0'>Declared by</h5><div>" + declared_by_str+ "</div>";
  modalBody.innerHTML = elDesc + elType + elDefault + elExample + elDeclaredBy;

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

var newUrl = '';

var setSearchQueryToUrlParam = function(query,release) {
  const urlParams = new URLSearchParams();
  urlParams.set('query', query);
  newUrl = `${window.location.pathname}?${urlParams.toString()}&release=${release}`;
  window.history.replaceState({}, '', newUrl);
};

var searchOptions = function(query) {
  results = search.search(query);

  // Performance optimization: skip ordering if query is a single character
  if (query.length > 1) {
    // Split terms by non-alphanumeric chars
    const terms = query.split(/[^A-Za-z0-9]/);

    results.sort((a, b) => {
      // Concatenate to sort first by occurence in title, then description.
      const aConcat = a.title + a.description;
      const bConcat = b.title + b.description;

      // We store last found index, to order based on remaining string.
      // This assumes that terms are written in the order that the user
      // expects them to appear in the title + description.
      var lastIndex = 0;

      for (var i = 0; i < terms.length; i++) {
        const term = terms[i];
        const aIndex = aConcat.slice(lastIndex).indexOf(term);

        // Not found in a, b must come first
        if (aIndex == -1) return 1;

        // No reason to index beyond result of lastIndex +aIndex + term.length,
        // as a would come first in that case.
        const bIndex = bConcat
        .slice(lastIndex, lastIndex + aIndex + term.length)
        .indexOf(term);

        // Not found in b, a must come first
        if (bIndex == -1) return -1;
        if (aIndex !== bIndex) return aIndex - bIndex

        // Increment lastIndex by found index and term length, to sort based
        // on remaining string.
        lastIndex += aIndex + term.length;
      }

      // Default to alphabetical order otherwise
      return aConcat.localeCompare(bConcat);
    });
  }

  updateOptionCountAndTable();
};

const SEARCH_INPUT_DEBOUNCE_MS = 100;

let debounceTimer;


function newSearch(){
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {

    const query = searchInput.value;
    const release = releaseSelect.selectedOptions[0].value;

    setSearchQueryToUrlParam(query, release);
    searchOptions(query);

  }, SEARCH_INPUT_DEBOUNCE_MS);
}

searchInput.oninput = function() {
  newSearch();
};

releaseSelect.onchange = function(){

  const query = searchInput.value;
  const release = releaseSelect.selectedOptions[0].value;

  setSearchQueryToUrlParam(query, release);

  window.location.replace(newUrl);
}

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

const urlParams = new URLSearchParams(window.location.search);

const releaseCurrentStable = document.getElementById('release_current_stable').value;

var release = urlParams.get('release') ?? releaseCurrentStable;
document.getElementById('releaseSelect').value = release;

xmlhttp.open('GET', 'data/options-'+release+'.json', true);
xmlhttp.send();
