/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from 'react'
import { TreeDataProvider, TreeItem, TreeItemCollapsibleState } from '@llm-canvas/sdk'

interface TreeNode {

  element: any
  item: TreeItem
  children?: TreeNode[]
  expanded: boolean
  level: number
  parent?: TreeNode
}

interface TreeViewHookResult<T> {
  rootNodes: TreeNode[]
  selectedElements: T[]
  expandedElements: Set<T>
  loading: boolean
  error: string | null

  // Actions
  selectElement: (element: T, multiSelect?: boolean) => void
  expandElement: (element: T) => Promise<void>
  collapseElement: (element: T) => void
  toggleElement: (element: T) => Promise<void>
  refresh: () => Promise<void>
  revealElement: (element: T) => Promise<void>
}

export function useTreeView<T = any>(dataProvider: TreeDataProvider<T>): TreeViewHookResult<T> {
  const [rootNodes, setRootNodes] = useState<TreeNode[]>([])
  const [selectedElements, setSelectedElements] = useState<T[]>([])
  const [expandedElements, setExpandedElements] = useState<Set<T>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTreeNode = useCallback(
    async (element: T, level: number, parent?: TreeNode): Promise<TreeNode> => {
      const item = await dataProvider.getTreeItem(element)
      const expanded =
        expandedElements.has(element) || item.collapsibleState === TreeItemCollapsibleState.Expanded

      const node: TreeNode = {
        element,
        item,
        expanded,
        level,
        parent
      }

      // Load children if expanded
      if (expanded && item.collapsibleState !== TreeItemCollapsibleState.None) {
        try {
          const childElements = await dataProvider.getChildren(element)
          node.children = await Promise.all(
            childElements.map((child) => createTreeNode(child, level + 1, node))
          )
        } catch (err) {
          console.error('Failed to load tree children:', err)
        }
      }

      return node
    },
    [dataProvider, expandedElements]
  )

  const loadTreeData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const rootElements = await dataProvider.getChildren()
      const nodes = await Promise.all(rootElements.map((element) => createTreeNode(element, 0)))

      setRootNodes(nodes)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tree data'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [dataProvider, createTreeNode])

  const selectElement = useCallback((element: T, multiSelect = false) => {
    setSelectedElements((prev) => {
      if (multiSelect) {
        return prev.includes(element) ? prev.filter((e) => e !== element) : [...prev, element]
      } else {
        return [element]
      }
    })
  }, [])

  const expandElement = useCallback(
    async (element: T) => {
      setExpandedElements((prev) => new Set([...prev, element]))

      // Find and update the node
      const updateNode = async (nodes: TreeNode[]): Promise<TreeNode[]> => {
        const updatedNodes: TreeNode[] = []

        for (const node of nodes) {
          if (node.element === element) {
            const updatedNode = { ...node, expanded: true }

            // Load children if not already loaded
            if (
              !updatedNode.children &&
              node.item.collapsibleState !== TreeItemCollapsibleState.None
            ) {
              try {
                const childElements = await dataProvider.getChildren(element)
                updatedNode.children = await Promise.all(
                  childElements.map((child) => createTreeNode(child, node.level + 1, updatedNode))
                )
              } catch (err) {
                console.error('Failed to expand tree node:', err)
              }
            }

            updatedNodes.push(updatedNode)
          } else {
            const updatedNode = { ...node }
            if (node.children) {
              updatedNode.children = await updateNode(node.children)
            }
            updatedNodes.push(updatedNode)
          }
        }

        return updatedNodes
      }

      setRootNodes(await updateNode(rootNodes))
    },
    [dataProvider, createTreeNode, rootNodes]
  )

  const collapseElement = useCallback(
    (element: T) => {
      setExpandedElements((prev) => {
        const newSet = new Set(prev)
        newSet.delete(element)
        return newSet
      })

      // Update node state
      const updateNode = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.map((node) => {
          if (node.element === element) {
            return { ...node, expanded: false }
          } else if (node.children) {
            return { ...node, children: updateNode(node.children) }
          }
          return node
        })
      }

      setRootNodes(updateNode(rootNodes))
    },
    [rootNodes]
  )

  const toggleElement = useCallback(
    async (element: T) => {
      if (expandedElements.has(element)) {
        collapseElement(element)
      } else {
        await expandElement(element)
      }
    },
    [expandedElements, expandElement, collapseElement]
  )

  const refresh = useCallback(async () => {
    await loadTreeData()
  }, [loadTreeData])

  const revealElement = useCallback(
    async (element: T) => {
      // Find path to element and expand all parents
      const findPath = async (
        searchElement: T,
        currentElement?: T,
        path: T[] = []
      ): Promise<T[] | null> => {
        if (currentElement === searchElement) {
          return path
        }

        const children = await dataProvider.getChildren(currentElement)

        for (const child of children) {
          if (child === searchElement) {
            return [...path, child]
          }

          const childPath = await findPath(searchElement, child, [...path, child])
          if (childPath) {
            return childPath
          }
        }

        return null
      }

      try {
        const path = await findPath(element)
        if (path) {
          // Expand all parents
          for (const pathElement of path.slice(0, -1)) {
            if (!expandedElements.has(pathElement)) {
              await expandElement(pathElement)
            }
          }

          // Select the element
          selectElement(element)
        }
      } catch (err) {
        console.error('Failed to reveal element:', err)
      }
    },
    [dataProvider, expandedElements, expandElement, selectElement]
  )

  // Load initial data
  useEffect(() => {
    loadTreeData()
  }, [loadTreeData])

  // Listen to data provider changes
  useEffect(() => {
    if (dataProvider.onDidChangeTreeData) {
      const disposable = dataProvider.onDidChangeTreeData(() => {
        loadTreeData()
      })
      return disposable.dispose
    }
  }, [dataProvider, loadTreeData])

  return useMemo(
    () => ({
      rootNodes,
      selectedElements,
      expandedElements,
      loading,
      error,
      selectElement,
      expandElement,
      collapseElement,
      toggleElement,
      refresh,
      revealElement
    }),
    [
      rootNodes,
      selectedElements,
      expandedElements,
      loading,
      error,
      selectElement,
      expandElement,
      collapseElement,
      toggleElement,
      refresh,
      revealElement
    ]
  )
}
