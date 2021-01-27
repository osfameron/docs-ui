/* global instantsearch algoliasearch */
var customSearch = {}
var search = instantsearch({
  indexName: 'test_stage_docs_couchbase', //prod_docs_couchbase',
  searchClient: algoliasearch('NI1G57N08Q', 'd3eff3e8bcc0860b8ceae87360a47d54'),
  searchFunction: function (helper) {
    var searchResults = document.querySelector('.result__container--outer')
    if (helper.state.query === '') {
      searchResults.style.display = 'none'
      return
    } else {
      searchResults.style.display = 'block'
    }

    helper.search()
  },
})

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Search for products...',
    autofocus: false,
    // searchAsYouType: false,
    showSubmit: false,
    showReset: false,
    showLoadingIndicator: false,
    searchOnInit: false,
    // attributeForDistinct: 'hierarchy.lvl0',
    distint: true,
    facets: ['*'],
  }),

  instantsearch.widgets.refinementList({
    templates: {
      header: 'Brand',
    },
    container: '#aisPanelBody',
    attribute: 'component',
  }),

  instantsearch.widgets.refinementList({
    templates: {
      header: 'Version',
    },
    container: '#aisVersionBody1',
    attribute: 'hierarchy.lvl0',
  }),

  instantsearch.widgets.hits({
    container: '#hits-container',
    templates: {
      // eslint-disable-next-line max-len
      item: '<div class="search-result"><a href="{{url}}" class="search-title">{{{_highlightResult.hierarchy.lvl1.value}}}</a><div class="search-content">{{content}}</div><div class="search-meta"><span>{{component}}</span><span>{{}}</span><span>Version({{version}})</span></div></div>',
      empty: 'No Result found',
    },
    transformItems: function (items) {
      var itemsArr = []
      customSearch = items.reduce(function (r, a) {
        // console.log('a', a)
        // console.log('r', r)
        r[a.hierarchy.lvl0] = [].concat(_toConsumableArray(r[a.hierarchy.lvl0] || []), [a])
        return r
      }, {})
      itemsArr.push(customSearch)
      // console.log(customSearch, 68)
      Object.entries(customSearch).forEach(function (val, ind) {
        // console.log(val[0], val[1], 70)
        itemsArr.push({ name: val[0], value: val[1] })
      })
      console.log(itemsArr, 74)
      return items
    },
  }),

  instantsearch.widgets.pagination({
    container: '#pagination-container',
  }),

])

search.start()

function _toConsumableArray (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i]
    }
    return arr2
  } else {
    return Array.from(arr)
  }
}
