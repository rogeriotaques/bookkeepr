<template>
  <section class="new-entry">
    <div class="row">
      <div class="col-4">
        <EntryForm />
      </div>
      <div class="col-8">
        <BalanceFilterForm />
        <BalanceTable />
      </div>
    </div>
  </section>
</template>

<script setup>
import EntryForm from '@/components/new-entry/EntryForm.vue';
import BalanceTable from '@/components/new-entry/BalanceTable.vue';
import BalanceFilterForm from '@/components/new-entry/BalanceFilterForm.vue';
</script>

<style lang="scss" scoped></style>
