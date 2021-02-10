'use strict'

const yaml = require('js-yaml')

module.exports = ({ data: { root: { contentCatalog, site } } }) => {
  let navGroups = site.keys.navGroups
  if (!navGroups) return '[]'
  if (navGroups._compiled) return navGroups
  const components = site.components
  const componentNames = Object.keys(components)
  navGroups = yaml.load(navGroups).reduce((accum, navGroup) => {
    const componentsInGroup = navGroup.components.reduce((matched, componentName) => {
      if (~componentName.indexOf('*')) {
        const rx = new RegExp(`^${componentName.replace(/[*]/g, '.*?')}$`)
        return matched.concat(componentNames.filter((candidate) => rx.test(candidate)))
      } else if (componentName in components) {
        return matched.concat(componentName)
      }
      return matched
    }, [])
    if (!componentsInGroup.length) return accum
    let startPage = navGroup.startPage
    if (startPage) {
      startPage = contentCatalog && contentCatalog.resolvePage(startPage)
      if (startPage) navGroup.url = startPage.pub.url
      delete navGroup.startPage
    }
    navGroup.components = componentsInGroup
    navGroup.latestVersions = componentsInGroup.reduce((latestVersionMap, it) => {
      latestVersionMap[it] = components[it].latest.version
      return latestVersionMap
    }, {})
    return accum.concat(navGroup)
  }, [])
  navGroups._compiled = true
  return (site.keys.navGroups = navGroups)
}
