import request from '@/utils/request';

// 获取分类树
export function getCategoryTree() {
  return request({
    url: '/api/quality/category/tree',
    method: 'get',
  });
}

// 获取标准列表
export function getStandardList(params) {
  return request({
    url: '/api/quality/standard/list',
    method: 'get',
    params,
  });
}

// 创建标准
export function createStandard(data) {
  return request({
    url: '/api/quality/standard',
    method: 'post',
    data,
  });
}

// 更新标准
export function updateStandard(data) {
  return request({
    url: `/api/quality/standard/${data.id}`,
    method: 'put',
    data,
  });
}

// 删除标准
export function deleteStandard(id) {
  return request({
    url: `/api/quality/standard/${id}`,
    method: 'delete',
  });
}

// 导出标准
export function exportStandards(params) {
  return request({
    url: '/api/quality/standard/export',
    method: 'get',
    params,
    responseType: 'blob',
  });
}

// 导入标准
export function importStandards(data) {
  return request({
    url: '/api/quality/standard/import',
    method: 'post',
    data,
  });
}

// 下载模板
export function downloadTemplate() {
  return request({
    url: '/api/quality/standard/template',
    method: 'get',
    responseType: 'blob',
  });
}
