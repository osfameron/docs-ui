/* global instantsearch algoliasearch */

var search = instantsearch({
  indexName: 'prod_docs_couchbase',
  searchClient: algoliasearch('NI1G57N08Q', 'd3eff3e8bcc0860b8ceae87360a47d54'),
})

search.addWidgets([
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Search for products...',
    autofocus: false,
  }),

  instantsearch.widgets.hits({
    container: '#hits-container',
    templates: {
      // eslint-disable-next-line max-len
      item: '<div class="search-result"><div class="search-title">{{hierarchy.lvl1}}</div><div class="search-content">{{content ? content : "No content found"}}</div><div class="search-meta"><span>{{component}}</span><span>{{}}</span><span>Version({{version}})</span></div></div>',
    },
  }),
  // instantsearch.widgets.pagination({
  //   container: '#pagination-container',
  // }),
])

search.start()
