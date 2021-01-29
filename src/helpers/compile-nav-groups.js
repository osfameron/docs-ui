'use strict'

const { inspect } = require('util')
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
      startPage = contentCatalog ? contentCatalog.resolvePage(startPage) : { url: '/index.html' }
      if (startPage) navGroup.url = startPage.url
      delete navGroup.startPage
    }
    navGroup.components = componentsInGroup
    return accum.concat(navGroup)
  }, [])
  navGroups._compiled = true
  return (site.keys.navGroups = navGroups)
}
