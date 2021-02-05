/* global instantsearch algoliasearch */
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
      console.log(helper.state.query)
      document.getElementById('queryText').innerHTML = helper.state.query
    }

    helper.search()
  },
})
var customSearch = {}

search.addWidgets([
  instantsearch.widgets.configure({
    hitsPerPage: 40,
    // enablePersonalization: true,
    // attributeForDistinct: 'hierarchy.lvl0',
    // distint: true,
  }),

  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Search Docs',
    autofocus: false,
    showLoadingIndicator: false,
    searchAsYouType: true,
    showSubmit: true,
    showReset: false,
    searchOnInit: false,
    facets: ['*'],
  }),

  // instantsearch.widgets.panel({
  //   hidden: function (options) {
  //     return options.results.nbHits === 0
  //   },
  //   templates: {
  //     header: 'Brand',
  //   },
  // }),

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
    container: '#hits',
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
      // console.log(itemsArr, 74)
      return items
    },
  }),

  instantsearch.widgets.pagination({
    container: '#pagination',
  }),

  instantsearch.widgets.stats({
    container: '#stats',
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
