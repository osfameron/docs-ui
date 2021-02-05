'use strict'

module.exports = ({ data: { root: { page, site } } }) => {
  const pageComponentName = page.component.name
  return site.keys.navGroups.find(({ components }) => components.includes(pageComponentName))
}
