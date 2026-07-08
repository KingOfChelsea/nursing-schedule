import { ref, computed } from 'vue';

export function useStandardData() {
  const standardData = ref([]);
  const currentStandardId = ref(null);

  // 模拟标准数据
  const mockStandardData = [
    {
      name: '护理值班查房评价标准（病区）',
      children: [
        {
          name: '急救车管理',
          children: [
            {
              name: '现场查看',
              children: [
                {
                  content: '定位放置；车面不放杂物；有急救车醒目标识',
                  score: 4,
                  method: '现场查看',
                  frequency: '每日',
                },
                {
                  content: '急救车整洁，活动自如',
                  score: 3,
                  method: '现场查看',
                  frequency: '每日',
                },
                {
                  content: '设立急救车点数记录本及基数表',
                  score: 4,
                  method: '现场查看',
                  frequency: '每日',
                },
                {
                  content: '物品定位放置，无菌与非无菌物品分类放置，放置合理，便于取用',
                  score: 5,
                  method: '现场查看',
                  frequency: '每日',
                },
                { content: '物品与基数表相符', score: 5, method: '现场查看', frequency: '每日' },
              ],
            },
            {
              name: '查阅记录',
              children: [
                {
                  content: '急救车点数记录本记录完整，签名规范',
                  score: 3,
                  method: '查阅记录',
                  frequency: '每周',
                },
                {
                  content: '急救车封条完好，封条更换记录完整',
                  score: 3,
                  method: '查阅记录',
                  frequency: '每周',
                },
              ],
            },
          ],
        },
        {
          name: '患者身份识别',
          children: [
            {
              name: '现场查看',
              children: [
                {
                  content: '患者佩戴腕带，信息清晰可辨',
                  score: 4,
                  method: '现场查看',
                  frequency: '每日',
                },
                {
                  content: '给药前核对腕带信息，执行双人核对',
                  score: 5,
                  method: '现场查看',
                  frequency: '每日',
                },
                {
                  content: '操作前后核对患者身份，使用两种以上方式',
                  score: 5,
                  method: '现场查看',
                  frequency: '每日',
                },
              ],
            },
            {
              name: '询问患者',
              children: [
                {
                  content: '患者知晓自己姓名、主管医生、责任护士',
                  score: 3,
                  method: '询问患者',
                  frequency: '每周',
                },
                {
                  content: '患者了解治疗方案及注意事项',
                  score: 3,
                  method: '询问患者',
                  frequency: '每周',
                },
              ],
            },
          ],
        },
        {
          name: '防跌倒管理',
          children: [
            {
              name: '现场查看',
              children: [
                {
                  content: '高危跌倒患者有防跌倒标识',
                  score: 4,
                  method: '现场查看',
                  frequency: '每日',
                },
                { content: '床栏完好，使用正确', score: 3, method: '现场查看', frequency: '每日' },
                { content: '地面干燥，无障碍物', score: 3, method: '现场查看', frequency: '每日' },
              ],
            },
            {
              name: '查阅资料',
              children: [
                {
                  content: '跌倒风险评估表填写完整、及时',
                  score: 4,
                  method: '查阅资料',
                  frequency: '每周',
                },
                { content: '防跌倒宣教记录完整', score: 3, method: '查阅资料', frequency: '每周' },
              ],
            },
          ],
        },
        {
          name: '危急值管理',
          children: [
            {
              name: '现场查看',
              children: [
                {
                  content: '危急值登记本记录完整',
                  score: 4,
                  method: '现场查看',
                  frequency: '每日',
                },
                { content: '5分钟内报告医生', score: 5, method: '现场查看', frequency: '每日' },
              ],
            },
            {
              name: '查阅记录',
              children: [
                {
                  content: '危急值处置记录完整，有时间记录',
                  score: 4,
                  method: '查阅记录',
                  frequency: '每日',
                },
                { content: '危急值追踪记录完整', score: 3, method: '查阅记录', frequency: '每日' },
              ],
            },
          ],
        },
        {
          name: '手卫生管理',
          children: [
            {
              name: '现场查看',
              children: [
                {
                  content: '洗手设施齐全，配备洗手液、干手设施',
                  score: 4,
                  method: '现场查看',
                  frequency: '每日',
                },
                {
                  content: '医护人员掌握洗手指征',
                  score: 4,
                  method: '现场查看',
                  frequency: '每日',
                },
                {
                  content: '操作前后洗手依从性好',
                  score: 5,
                  method: '现场查看',
                  frequency: '每日',
                },
              ],
            },
            {
              name: '技能考核',
              children: [
                { content: '七步洗手法操作规范', score: 4, method: '技能考核', frequency: '每月' },
                {
                  content: '手卫生知识知晓率达标',
                  score: 3,
                  method: '技能考核',
                  frequency: '每月',
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  // 计算总分
  const totalScore = computed(() => {
    let score = 0;
    const traverse = (items) => {
      items.forEach((item) => {
        if (item.children) {
          traverse(item.children);
        } else if (item.score) {
          score += item.score;
        }
      });
    };
    traverse(standardData.value);
    return score;
  });

  // 计算总项数
  const totalItems = computed(() => {
    let count = 0;
    const traverse = (items) => {
      items.forEach((item) => {
        if (item.children) {
          traverse(item.children);
        } else {
          count++;
        }
      });
    };
    traverse(standardData.value);
    return count;
  });

  // 一级分类选项
  const firstLevelOptions = computed(() => {
    return standardData.value.map((item) => item.name);
  });

  // 二级分类选项
  const secondLevelOptions = computed(() => {
    const first = standardData.value.find((item) => item.name === selectedFirstLevel.value);
    return first ? first.children.map((item) => item.name) : [];
  });

  // 三级分类选项
  const thirdLevelOptions = computed(() => {
    const first = standardData.value.find((item) => item.name === selectedFirstLevel.value);
    if (!first) return [];
    const second = first.children.find((item) => item.name === selectedSecondLevel.value);
    return second ? second.children.map((item) => item.name) : [];
  });

  // 当前选择的级别
  const selectedFirstLevel = ref('');
  const selectedSecondLevel = ref('');
  const selectedThirdLevel = ref('');

  // 加载标准数据
  const loadStandardData = (categoryId = null) => {
    currentStandardId.value = categoryId;
    standardData.value = JSON.parse(JSON.stringify(mockStandardData));
  };

  // 添加标准项
  const addStandardItem = (formData) => {
    const newItem = {
      content: formData.content,
      score: formData.score,
      method: formData.method,
      frequency: formData.frequency,
    };

    // 找到对应的三级节点并添加
    const first = standardData.value.find((f) => f.name === formData.firstLevel);
    if (first) {
      const second = first.children.find((s) => s.name === formData.secondLevel);
      if (second) {
        const third = second.children.find((t) => t.name === formData.thirdLevel);
        if (third) {
          if (!third.children) third.children = [];
          third.children.push(newItem);
        }
      }
    }
  };

  // 删除标准项
  const removeStandardItem = (item) => {
    const traverseAndRemove = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i] === item) {
          items.splice(i, 1);
          return true;
        }
        if (items[i].children) {
          if (traverseAndRemove(items[i].children)) {
            return true;
          }
        }
      }
      return false;
    };
    traverseAndRemove(standardData.value);
  };

  // 更新标准项
  const updateStandardItem = (oldItem, newData) => {
    const traverseAndUpdate = (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i] === oldItem) {
          items[i] = { ...items[i], ...newData };
          return true;
        }
        if (items[i].children) {
          if (traverseAndUpdate(items[i].children)) {
            return true;
          }
        }
      }
      return false;
    };
    traverseAndUpdate(standardData.value);
  };

  return {
    standardData,
    totalScore,
    totalItems,
    firstLevelOptions,
    secondLevelOptions,
    thirdLevelOptions,
    selectedFirstLevel,
    selectedSecondLevel,
    selectedThirdLevel,
    loadStandardData,
    addStandardItem,
    removeStandardItem,
    updateStandardItem,
  };
}
