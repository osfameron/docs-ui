;(function () {
  'use strict'

  var pageNavigationGroup = window.pageNavigationGroup
  if (!pageNavigationGroup) return

  var siteNavigationData = window.siteNavigationData.reduce(function (accum, entry) {
    return (accum[entry.name] = entry) && accum
  }, {})

  var navContainer = document.querySelector('.nav-container')
  buildNav(navContainer, getPage(), pageNavigationGroup, siteNavigationData)
  activateNav(navContainer)

  function getPage () {
    var head = document.head
    return {
      component: head.querySelector('meta[name="dcterms.subject"]').getAttribute('content'),
      version: head.querySelector('meta[name="dcterms.identifier"]').getAttribute('content'),
      url: head.querySelector('meta[name=page-url]').getAttribute('content'),
    }
  }

  function buildNav (container, page, group, navData) {
    var groupEl = createElement('div', 'components')
    var groupNameEl = createElement('div', 'components-name')
    groupNameEl.appendChild(document.createTextNode(group.title))
    groupEl.appendChild(groupNameEl)
    var componentsListEl = createElement('ul', 'components_list')
    group.components.forEach(function (componentName) {
      var componentNavData = navData[componentName]
      var componentsListItemsEl = createElement('li', 'components_list-items')
      var componentVersionsEl = createElement('div', 'component_list-version')
      // FIXME we would prefer if the navigation data identified the latest version itself
      var selectedVersion = componentName === page.component ? page.version : group.latestVersions[componentName]
      var componentTitleEl = createElement('span', 'component_list_title')
      componentTitleEl.appendChild(document.createTextNode(componentNavData.title))
      componentVersionsEl.appendChild(componentTitleEl)
      var componentVersionsSelectEl = createElement('select', 'version_list')
      componentNavData.versions.forEach(function (componentVersion) {
        var optionEl = createElement('option')
        optionEl.value = componentVersion.version
        if (componentVersion.version === selectedVersion) optionEl.setAttribute('selected', '')
        optionEl.appendChild(document.createTextNode(componentVersion.displayVersion || componentVersion.version))
        componentVersionsSelectEl.appendChild(optionEl)
      })
      componentVersionsEl.appendChild(componentVersionsSelectEl)
      componentsListItemsEl.appendChild(componentVersionsEl)
      componentNavData.versions.forEach(function (componentVersion) {
        var componentVersionNavEl = createElement('div', 'version_items')
        // TODO only open if no page is found
        if (page.component !== componentName || page.version !== componentVersion.version) {
          componentVersionNavEl.classList.add('hide')
        }
        componentVersionNavEl.dataset.version = componentVersion.version
        buildNavTree(componentVersion.sets, componentVersionNavEl, page, [])
        componentsListItemsEl.appendChild(componentVersionNavEl)
      })
      componentsListEl.appendChild(componentsListItemsEl)
    })
    groupEl.appendChild(componentsListEl)
    container.appendChild(groupEl)
  }

  function buildNavTree (items, parent, page, currentPath) {
    if (!(items || []).length) return
    var navListEl = createElement('ul', 'menu_row')
    // FIXME we could pass some sort of forceOpen flag so hide is automatically removed
    if (currentPath.length) navListEl.classList.add('hide')
    currentPath = currentPath.concat(navListEl)
    items.forEach(function (item) {
      var navItemEl = createElement('li', 'menu_list')
      var navTextEl
      var isCurrentPage
      if (item.url) {
        navTextEl = createElement('a', 'menu_title menu_link')
        navTextEl.href = relativize(page.url, item.url)
        if (page.url === item.url) {
          isCurrentPage = true
          navItemEl.classList.add('is-current-page')
          currentPath.forEach(function (ancestorEl) {
            ancestorEl.classList.remove('hide')
          })
        }
      } else {
        navTextEl = createElement('span', 'menu_title menu_text')
      }
      navTextEl.innerHTML = item.content
      navItemEl.appendChild(navTextEl)
      // FIXME we could pass some sort of forceOpen flag so hide is automatically removed
      var childNavListEl = buildNavTree(item.items, navItemEl, page, currentPath)
      if (isCurrentPage && childNavListEl) childNavListEl.classList.remove('hide')
      navListEl.appendChild(navItemEl)
    })
    return parent.appendChild(navListEl)
  }

  function relativize (from, to) {
    if (!(from && to.charAt() === '/')) return to
    var hash = ''
    var hashIdx = to.indexOf('#')
    if (~hashIdx) {
      hash = to.substr(hashIdx)
      to = to.substr(0, hashIdx)
    }
    if (from === to) {
      return hash || (to.charAt(to.length - 1) === '/' ? './' : to.substr(to.lastIndexOf('/') + 1))
    } else {
      return (
        (computeRelativePath(from.slice(0, from.lastIndexOf('/')), to) || '.') +
        (to.charAt(to.length - 1) === '/' ? '/' + hash : hash)
      )
    }
  }

  function computeRelativePath (from, to) {
    var fromParts = trimArray(from.split('/'))
    var toParts = trimArray(to.split('/'))
    for (var i = 0, l = Math.min(fromParts.length, toParts.length), sharedPathLength = l; i < l; i++) {
      if (fromParts[i] !== toParts[i]) {
        sharedPathLength = i
        break
      }
    }
    var outputParts = []
    for (var remain = fromParts.length - sharedPathLength; remain > 0; remain--) outputParts.push('..')
    return outputParts.concat(toParts.slice(sharedPathLength)).join('/')
  }

  function trimArray (arr) {
    var start = 0
    var length = arr.length
    for (; start < length; start++) {
      if (arr[start]) break
    }
    if (start === length) return []
    for (var end = length; end > 0; end--) {
      if (arr[end - 1]) break
    }
    return arr.slice(start, end)
  }

  function createElement (tagName, className) {
    var el = document.createElement(tagName)
    if (className) el.className = className
    return el
  }

  function find (selector, from) {
    return [].slice.call((from || document).querySelectorAll(selector))
  }

  // FIXME integrate into nav builder
  function activateNav (container) {
    find('.component_list_title', container).forEach(function (componentTitleEl) {
      componentTitleEl.style.cursor = 'pointer'
      componentTitleEl.addEventListener('click', function () {
        var versionEl = componentTitleEl.parentNode
        var componentVersionEl = versionEl.parentNode
        var activeVersionEl = componentVersionEl.querySelector('.version_items:not(.hide)')
        if (activeVersionEl) {
          activeVersionEl.classList.add('hide')
        } else {
          var activateVersionEl = componentVersionEl.querySelector(
            '.version_items[data-version="' + componentVersionEl.querySelector('.version_list').value + '"]'
          )
          if (activateVersionEl) activateVersionEl.classList.remove('hide')
        }
      })
    })

    find('.menu_title', container).forEach(function (menuTitleEl) {
      if (!menuTitleEl.nextElementSibling) return
      if (!menuTitleEl.href) menuTitleEl.style.cursor = 'pointer'
      menuTitleEl.addEventListener('click', function (e) {
        e.preventDefault()
        menuTitleEl.nextElementSibling.classList.toggle('hide')
      })
    })

    find('.version_list', container).forEach(function (versionListEl) {
      versionListEl.addEventListener('change', function () {
        var componentVersionEl = versionListEl.parentNode.parentNode
        var activeVersionEl = componentVersionEl.querySelector('.version_items:not(.hide)')
        if (activeVersionEl) activeVersionEl.classList.add('hide')
        var activateVersionEl = componentVersionEl.querySelector(
          '.version_items[data-version="' + versionListEl.value + '"]'
        )
        if (activateVersionEl) activateVersionEl.classList.remove('hide')
      })
    })
  }
})()
