<script setup>
import EntryForm from '@/components/new-entry/EntryForm.vue';
import BalanceTable from '@/components/new-entry/BalanceTable.vue';
</script>

<template>
  <section class="new-entry">
    <div class="row">
      <div class="col-4">
        <EntryForm />
      </div>
      <div class="col-8">
        <BalanceTable />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped></style>
