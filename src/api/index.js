const STORAGE_KEY = 'nursing_schedule_db'

const defaultData = {
  wards: [
    { id: 'ward_001', name: '内科病区', sortOrder: 1 },
    { id: 'ward_002', name: '外科病区', sortOrder: 2 },
    { id: 'ward_003', name: '儿科病区', sortOrder: 3 },
  ],
  globalShifts: [
    { id: 'gs_1', name: '早班', startTime: '08:00', endTime: '16:00', color: '#409eff', sortOrder: 1 },
    { id: 'gs_2', name: '晚班', startTime: '16:00', endTime: '00:00', color: '#67c23a', sortOrder: 2 },
    { id: 'gs_3', name: '夜班', startTime: '00:00', endTime: '08:00', color: '#909399', sortOrder: 3 },
    { id: 'gs_4', name: '休息', startTime: '', endTime: '', color: '#e6a23c', sortOrder: 4 },
    { id: 'gs_5', name: '请假', startTime: '', endTime: '', color: '#f56c6c', sortOrder: 5 },
  ],
  wardShifts: [
    { id: 'ws_1', wardId: 'ward_001', globalShiftId: 'gs_1', name: '早班', startTime: '08:00', endTime: '16:00', color: '#409eff', sortOrder: 1, hours: 8, isNight: false },
    { id: 'ws_2', wardId: 'ward_001', globalShiftId: 'gs_2', name: '晚班', startTime: '16:00', endTime: '00:00', color: '#67c23a', sortOrder: 2, hours: 8, isNight: false },
    { id: 'ws_3', wardId: 'ward_001', globalShiftId: 'gs_3', name: '夜班', startTime: '00:00', endTime: '08:00', color: '#909399', sortOrder: 3, hours: 8, isNight: true },
    { id: 'ws_4', wardId: 'ward_001', globalShiftId: 'gs_4', name: '休息', startTime: '', endTime: '', color: '#e6a23c', sortOrder: 4, hours: 0, isNight: false },
  ],
  holidays: [
    { id: 'h_1', name: '元旦', date: '2026-01-01', type: 'legal' },
    { id: 'h_2', name: '春节', date: '2026-02-17', type: 'legal' },
    { id: 'h_3', name: '清明节', date: '2026-04-05', type: 'legal' },
  ],
  groups: [
    { id: 'g_1', wardId: 'ward_001', name: 'A组', sortOrder: 1 },
    { id: 'g_2', wardId: 'ward_001', name: 'B组', sortOrder: 2 },
    { id: 'g_3', wardId: 'ward_001', name: 'C组', sortOrder: 3 },
  ],
  nurses: [
    { id: 'n_1', wardId: 'ward_001', groupId: 'g_1', name: '李护士', employeeNo: 'N001', sortOrder: 1, baseHours: 8, cumulativeLeave: 0 },
    { id: 'n_2', wardId: 'ward_001', groupId: 'g_1', name: '王护士', employeeNo: 'N002', sortOrder: 2, baseHours: 8, cumulativeLeave: 0 },
    { id: 'n_3', wardId: 'ward_001', groupId: 'g_2', name: '赵护士', employeeNo: 'N003', sortOrder: 3, baseHours: 8, cumulativeLeave: 0.5, },
    { id: 'n_4', wardId: 'ward_001', groupId: 'g_2', name: '陈护士', employeeNo: 'N004', sortOrder: 4, baseHours: 8, cumulativeLeave: 0 },
    { id: 'n_5', wardId: 'ward_001', groupId: 'g_3', name: '刘护士', employeeNo: 'N005', sortOrder: 5, baseHours: 7, cumulativeLeave: 1.5 },
  ],
  schedules: [],
  leaves: [],
  expectations: [],
  leaveBalances: [
    { nurseId: 'n_1', annual: 5, overtime: 10, compOff: 2 },
    { nurseId: 'n_2', annual: 3, overtime: 5, compOff: 1 },
    { nurseId: 'n_3', annual: 7, overtime: 8, compOff: 0 },
    { nurseId: 'n_4', annual: 2, overtime: 12, compOff: 3 },
    { nurseId: 'n_5', annual: 6, overtime: 6, compOff: 1 },
  ],
}

function getDb() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) return JSON.parse(raw)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
  return { ...defaultData }
}

function saveDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
}

function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
}

// ====== API 预留层 ======
// 所有数据操作方法都通过这里，未来替换为真实API时只需修改此处

export async function apiGet(path) {
  const db = getDb()
  return db[path] || []
}

export async function apiPost(path, data) {
  const db = getDb()
  if (!Array.isArray(db[path])) db[path] = []
  db[path].push(data)
  saveDb(db)
  return data
}

export async function apiPut(path, id, data) {
  const db = getDb()
  const idx = db[path].findIndex(item => item.id === id)
  if (idx !== -1) {
    db[path][idx] = { ...db[path][idx], ...data }
    saveDb(db)
    return db[path][idx]
  }
  return null
}

export async function apiDelete(path, id) {
  const db = getDb()
  db[path] = db[path].filter(item => item.id !== id)
  saveDb(db)
  return true
}

// ====== 业务数据方法 ======

export const GlobalShiftApi = {
  list: () => apiGet('globalShifts'),
  add: (data) => apiPost('globalShifts', { ...data, id: generateId('gs') }),
  update: (id, data) => apiPut('globalShifts', id, data),
  remove: (id) => apiDelete('globalShifts', id),
}

export const WardShiftApi = {
  list: (wardId) => apiGet('wardShifts').then(list => list.filter(i => i.wardId === wardId)),
  add: (data) => apiPost('wardShifts', { ...data, id: generateId('ws') }),
  update: (id, data) => apiPut('wardShifts', id, data),
  remove: (id) => apiDelete('wardShifts', id),
}

export const HolidayApi = {
  list: () => apiGet('holidays'),
  add: (data) => apiPost('holidays', { ...data, id: generateId('h') }),
  update: (id, data) => apiPut('holidays', id, data),
  remove: (id) => apiDelete('holidays', id),
}

export const GroupApi = {
  list: (wardId) => apiGet('groups').then(list => list.filter(i => i.wardId === wardId)),
  add: (data) => apiPost('groups', { ...data, id: generateId('g') }),
  update: (id, data) => apiPut('groups', id, data),
  remove: (id) => apiDelete('groups', id),
}

export const NurseApi = {
  list: (wardId) => apiGet('nurses').then(list => list.filter(i => i.wardId === wardId)),
  add: (data) => apiPost('nurses', { ...data, id: generateId('n') }),
  update: (id, data) => apiPut('nurses', id, data),
  remove: (id) => apiDelete('nurses', id),
}

export const ScheduleApi = {
  list: (wardId, startDate, endDate) => apiGet('schedules').then(list =>
    list.filter(i => i.wardId === wardId && i.date >= startDate && i.date <= endDate)
  ),
  add: (data) => apiPost('schedules', { ...data, id: generateId('sch') }),
  update: (id, data) => apiPut('schedules', id, data),
  remove: (id) => apiDelete('schedules', id),
  batchSave: (items) => {
    const db = getDb()
    items.forEach(item => {
      const idx = db.schedules.findIndex(s => s.nurseId === item.nurseId && s.date === item.date)
      if (idx !== -1) {
        db.schedules[idx] = { ...db.schedules[idx], ...item }
      } else {
        db.schedules.push({ ...item, id: generateId('sch') })
      }
    })
    saveDb(db)
    return items
  },
}

export const LeaveApi = {
  list: (nurseId) => apiGet('leaves').then(list => nurseId ? list.filter(i => i.nurseId === nurseId) : list),
  add: (data) => apiPost('leaves', { ...data, id: generateId('lv'), status: 'pending', createTime: new Date().toISOString() }),
  update: (id, data) => apiPut('leaves', id, data),
  remove: (id) => apiDelete('leaves', id),
}

export const ExpectationApi = {
  list: (nurseId) => apiGet('expectations').then(list => nurseId ? list.filter(i => i.nurseId === nurseId) : list),
  add: (data) => apiPost('expectations', { ...data, id: generateId('exp') }),
  update: (id, data) => apiPut('expectations', id, data),
  remove: (id) => apiDelete('expectations', id),
}

export const WardApi = {
  list: () => apiGet('wards'),
  add: (data) => apiPost('wards', { ...data, id: generateId('w') }),
  update: (id, data) => apiPut('wards', id, data),
  remove: (id) => apiDelete('wards', id),
}

export const LeaveBalanceApi = {
  list: () => apiGet('leaveBalances'),
  update: (nurseId, data) => {
    const db = getDb()
    const idx = db.leaveBalances.findIndex(i => i.nurseId === nurseId)
    if (idx !== -1) {
      db.leaveBalances[idx] = { ...db.leaveBalances[idx], ...data }
      saveDb(db)
      return db.leaveBalances[idx]
    }
    return null
  },
}





