import { isVisibleContent } from './contentHelpers'
/**
 * Builds a stable navigation tree node key.
 * @param {*} ...parts - Input value used by nodeKey.
 * @returns {*} The computed result or the documented side effect.
 */
export const nodeKey = (...parts) => parts.filter(Boolean).join(':')

/**
 * Converts a sub_tab into a leaf navigation node.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
const subTabNode = ({ tab, category = null, subTab, level }) => ({
  id: nodeKey('sub', tab.id, category?.id || 'direct', subTab.id),
  kind: 'subTab',
  level,
  label: subTab.label,
  tab,
  category,
  subTab,
  children: [],
})

/**
 * Converts a category into a branch navigation node.
 * @param {...*} args - Inputs are the values declared by the function signature.
 * @returns {*} The computed result or the documented side effect.
 */
const categoryNode = ({ tab, category, level }) => ({
  id: nodeKey('category', tab.id, category.id),
  kind: 'category',
  level,
  label: category.label,
  tab,
  category,
  children: (category.sub_tabs || [])
    .filter(isVisibleContent)
    .map((subTab) => subTabNode({
      tab,
      category,
      subTab,
      level: level + 1,
    })),
})

/**
 * Builds all child navigation nodes for one root tab.
 * @param {*} tab - Input value used by childrenForTab.
 * @returns {*} The computed result or the documented side effect.
 */
const childrenForTab = (tab) => {
  if (tab.layout !== 'two-level') return []

  const categoryChildren = (tab.categories || []).filter(isVisibleContent).flatMap((category) => {
    const subTabs = (category.sub_tabs || []).filter(isVisibleContent)
    if (!subTabs.length) return [categoryNode({ tab, category, level: 1 })]
    if (subTabs.length === 1) {
      return [subTabNode({ tab, category, subTab: subTabs[0], level: 1 })]
    }
    return [categoryNode({ tab, category, level: 1 })]
  })

  const directChildren = (tab.sub_tabs || []).filter(isVisibleContent).map((subTab) => subTabNode({
    tab,
    subTab,
    level: 1,
  }))

  return [...categoryChildren, ...directChildren]
}

/**
 * Converts site tabs into a recursive sidebar navigation tree.
 * @param {*} siteData - Input value used by buildNavigationTree.
 * @returns {*} The computed result or the documented side effect.
 */
export const buildNavigationTree = (siteData) => (siteData.tabs || []).filter(isVisibleContent).map((tab, index) => ({
  id: nodeKey('tab', tab.id),
  kind: 'tab',
  level: 0,
  index: String(index + 1).padStart(2, '0'),
  label: tab.label,
  tab,
  children: childrenForTab(tab),
}))

/**
 * Checks whether a tree node matches the active page selection.
 * @param {*} node - Input value used by matchesSelection.
 * @param {*} selection - Input value used by matchesSelection.
 * @returns {*} The computed result or the documented side effect.
 */
const matchesSelection = (node, selection) => {
  if (node.kind === 'tab' && !node.children.length) return node.tab.id === selection.tabId
  if (node.kind === 'category' && !node.children.length) {
    return node.tab.id === selection.tabId
      && node.category.id === selection.categoryId
      && !selection.subTabId
  }
  if (node.kind !== 'subTab') return false

  return node.tab.id === selection.tabId
    && node.subTab.id === selection.subTabId
    && (node.category?.id || null) === (selection.categoryId || null)
}

/**
 * Finds the path from root node to active leaf node.
 * @param {*} nodes - Input value used by findPath.
 * @param {*} selection - Input value used by findPath.
 * @param {*} ancestors - Input value used by findPath.
 * @returns {*} The computed result or the documented side effect.
 */
const findPath = (nodes, selection, ancestors = []) => {
  for (const node of nodes) {
    const path = [...ancestors, node]
    if (matchesSelection(node, selection)) return path

    const childPath = findPath(node.children || [], selection, path)
    if (childPath.length) return childPath
  }
  return []
}

/**
 * Returns the active navigation path for a selection object.
 * @param {*} tree - Input value used by navigationPathForSelection.
 * @param {*} selection - Input value used by navigationPathForSelection.
 * @returns {*} The computed result or the documented side effect.
 */
export const navigationPathForSelection = (tree, selection) => findPath(tree, selection)

/**
 * Returns branch node ids that should be expanded for a path.
 * @param {*} path - Input value used by expandedIdsForPath.
 * @returns {*} The computed result or the documented side effect.
 */
export const expandedIdsForPath = (path) => new Set(path.slice(0, -1).map((node) => node.id))

