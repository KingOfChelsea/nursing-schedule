<template>
    <div class="page-container">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>全院休假记录</span>
                    <el-button @click="exportRecords">
                        <el-icon><Download /></el-icon>导出Excel
                    </el-button>
                </div>
            </template>
            <el-form :inline="true" :model="filterForm" class="filter-form">
                <el-form-item label="科室">
                    <el-select
                        v-model="filterForm.wardId"
                        placeholder="选择科室"
                        clearable
                        style="width: 160px"
                    >
                        <el-option label="内科病区" value="ward_001" />
                        <el-option label="外科病区" value="ward_002" />
                    </el-select>
                </el-form-item>
                <el-form-item label="时间">
                    <el-date-picker
                        v-model="filterForm.dateRange"
                        type="daterange"
                        value-format="YYYY-MM-DD"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
                    />
                </el-form-item>
                <el-form-item label="人员">
                    <el-select
                        v-model="filterForm.nurseId"
                        placeholder="选择护士"
                        clearable
                        style="width: 160px"
                    >
                        <el-option
                            v-for="n in allNurses"
                            :key="n.id"
                            :label="n.name"
                            :value="n.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleFilter"
                        >查询</el-button
                    >
                    <el-button @click="resetFilter">重置</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="filteredRecords" border stripe v-loading="loading">
                <el-table-column prop="nurseName" label="护士姓名" />
                <el-table-column prop="wardName" label="科室" />
                <el-table-column prop="type" label="请假类型" />
                <el-table-column prop="startDate" label="开始日期" />
                <el-table-column prop="endDate" label="结束日期" />
                <el-table-column
                    prop="reason"
                    label="原因"
                    show-overflow-tooltip
                />
                <el-table-column label="状态">
                    <template #default="{ row }">
                        <el-tag
                            :type="
                                row.status === 'approved'
                                    ? 'success'
                                    : row.status === 'rejected'
                                      ? 'danger'
                                      : 'info'
                            "
                        >
                            {{
                                row.status === 'approved'
                                    ? '已通过'
                                    : row.status === 'rejected'
                                      ? '已拒绝'
                                      : '待审批'
                            }}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { LeaveApi, NurseApi } from '@/api';

const loading = ref(false);
const leaves = ref([]);
const allNurses = ref([]);
const filterForm = ref({ wardId: '', dateRange: [], nurseId: '' });

const nurseMap = computed(() => {
    const map = {};
    allNurses.value.forEach((n) => (map[n.id] = n));
    return map;
});

const filteredRecords = computed(() => {
    return leaves.value
        .filter((l) => {
            if (
                filterForm.value.wardId &&
                nurseMap.value[l.nurseId]?.wardId !== filterForm.value.wardId
            )
                return false;
            if (
                filterForm.value.nurseId &&
                l.nurseId !== filterForm.value.nurseId
            )
                return false;
            if (filterForm.value.dateRange?.length === 2) {
                if (
                    l.startDate > filterForm.value.dateRange[1] ||
                    l.endDate < filterForm.value.dateRange[0]
                )
                    return false;
            }
            return true;
        })
        .map((l) => ({
            ...l,
            nurseName: nurseMap.value[l.nurseId]?.name || l.nurseId,
            wardName:
                nurseMap.value[l.nurseId]?.wardId === 'ward_001'
                    ? '内科病区'
                    : '外科病区',
        }));
});

const loadData = async () => {
    loading.value = true;
    const [lv, ns] = await Promise.all([LeaveApi.list(), NurseApi.list()]);
    leaves.value = lv;
    allNurses.value = ns;
    loading.value = false;
};

const handleFilter = () => {};
const resetFilter = () => {
    filterForm.value = { wardId: '', dateRange: [], nurseId: '' };
};

const exportRecords = () => {
    const csv =
        '护士姓名,科室,请假类型,开始日期,结束日期,原因,状态\n' +
        filteredRecords.value
            .map(
                (r) =>
                    `${r.nurseName},${r.wardName},${r.type},${r.startDate},${r.endDate},${r.reason},${r.status === 'approved' ? '已通过' : r.status === 'rejected' ? '已拒绝' : '待审批'}`,
            )
            .join('\n');
    const blob = new Blob(['\ufeff' + csv], {
        type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '全院休假记录.csv';
    link.click();
    ElMessage.success('导出成功');
};

onMounted(loadData);
</script>

<style lang="scss" scoped>
.page-container {
    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .filter-form {
        margin-bottom: 16px;
    }
}
</style>
