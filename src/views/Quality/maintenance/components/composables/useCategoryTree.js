import { ref } from 'vue';

export function useCategoryTree() {
  const categoryTree = ref([]);
  const filterText = ref('');

  // 模拟初始数据
  const mockCategoryTree = [
    {
      id: 1,
      name: '全部',
      level: 1,
      count: 146,
      children: [
        {
          id: 11,
          name: '护理总值班',
          level: 2,
          count: 98,
          children: [
            {
              id: 111,
              name: '2026年1月护理总值班（病区）(及格线:85)',
              level: 3,
              passLine: 85,
              year: '2026年',
              count: 32,
            },
            {
              id: 112,
              name: '2026年1月护理总值班（门急诊）(及格线:85)',
              level: 3,
              passLine: 85,
              year: '2026年',
              count: 30,
            },
            {
              id: 113,
              name: '2026年2月护理总值班（病区）(及格线:85)',
              level: 3,
              passLine: 85,
              year: '2026年',
              count: 36,
            },
          ],
        },
        {
          id: 12,
          name: '普通病区',
          level: 2,
          count: 48,
          children: [
            {
              id: 121,
              name: '基础护理质量标准(及格线:90)',
              level: 3,
              passLine: 90,
              year: '2026年',
              count: 24,
            },
            {
              id: 122,
              name: '专科护理质量标准(及格线:90)',
              level: 3,
              passLine: 90,
              year: '2026年',
              count: 24,
            },
          ],
        },
      ],
    },
  ];

  // 初始化
  const initTree = () => {
    categoryTree.value = JSON.parse(JSON.stringify(mockCategoryTree));
  };

  // 添加分类
  const addCategory = (formData) => {
    const newNode = {
      id: Date.now(),
      name: formData.name,
      level: formData.level,
      year: formData.year || '',
      passLine: formData.passLine || 85,
      count: 0,
      children: [],
    };

    if (formData.parentId) {
      const parent = findInTree(categoryTree.value, formData.parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(newNode);
        // 更新父节点计数
        updateCount(parent);
      }
    } else {
      categoryTree.value.push(newNode);
    }
  };

  // 更新分类
  const updateCategory = (id, formData) => {
    const node = findInTree(categoryTree.value, id);
    if (node) {
      node.name = formData.name;
      node.year = formData.year || node.year;
      node.passLine = formData.passLine || node.passLine;
    }
  };

  // 删除分类
  const removeCategory = (id) => {
    removeFromTree(categoryTree.value, id);
  };

  // 从树中移除节点
  const removeFromTree = (tree, id) => {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === id) {
        tree.splice(i, 1);
        return true;
      }
      if (tree[i].children) {
        if (removeFromTree(tree[i].children, id)) {
          // 更新父节点计数
          updateCount(tree[i]);
          return true;
        }
      }
    }
    return false;
  };

  // 在树中查找节点
  const findInTree = (tree, id) => {
    for (const node of tree) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 更新节点计数
  const updateCount = (node) => {
    if (node.children) {
      node.count = node.children.reduce((sum, child) => sum + (child.count || 0), 0);
    }
  };

  // 获取所有三级节点（用于标准数据加载）
  const getThirdLevelNodes = () => {
    const result = [];
    const traverse = (nodes) => {
      nodes.forEach((node) => {
        if (node.level === 3) {
          result.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(categoryTree.value);
    return result;
  };

  // 初始化
  initTree();

  return {
    categoryTree,
    filterText,
    addCategory,
    updateCategory,
    removeCategory,
    findInTree,
    getThirdLevelNodes,
  };
}
