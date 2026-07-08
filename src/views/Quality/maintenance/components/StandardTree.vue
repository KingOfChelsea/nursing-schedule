<template>
  <div class="standard-tree">
    <RootInfoCard :total-score="totalScore" :total-items="totalItems" />

    <div class="standard-items">
      <FirstLevelSection
        v-for="(first, fi) in standardData"
        :key="fi"
        :data="first"
        :index="fi"
        :show-detail="showDetail"
        @add-item="$emit('add-item', $event)"
        @edit-item="$emit('edit-item', $event)"
        @delete-item="$emit('delete-item', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import RootInfoCard from './RootInfoCard.vue';
import FirstLevelSection from './FirstLevelSection.vue';

const props = defineProps({
  standardData: { type: Array, default: () => [] },
  showDetail: { type: Boolean, default: true },
});

defineEmits(['add-item', 'edit-item', 'delete-item']);

const totalScore = computed(() => {
  let score = 0;
  const traverse = (items) => {
    items.forEach((item) => {
      if (item.children) traverse(item.children);
      else if (item.score) score += item.score;
    });
  };
  traverse(props.standardData);
  return score;
});

const totalItems = computed(() => {
  let count = 0;
  const traverse = (items) => {
    items.forEach((item) => {
      if (item.children) traverse(item.children);
      else count++;
    });
  };
  traverse(props.standardData);
  return count;
});
</script>

<style lang="scss" scoped>
.standard-tree {
  .standard-items {
    margin-top: 20px;
  }
}
</style>
