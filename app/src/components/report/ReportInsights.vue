<template>
  <div class="report__insight">
    <div class="row has-text-centered">
      <div class="col-4">
        <div class="card">
          <div class="card__math">
            <p class="card__figure--income">+ ¥12,000,000</p>
            <p class="card__figure--outcome">- ¥6,000,000</p>
          </div>
          <h3 class="title">¥0,000</h3>
          <p class="subtitle">This year</p>
        </div>
      </div>
      <div class="col-4">
        <div class="card">
          <div class="card__math">
            <p class="card__figure--income">+ ¥1,000,000</p>
            <p class="card__figure--outcome">- ¥500,000</p>
          </div>
          <h3 class="title">¥0,000</h3>
          <p class="subtitle">This month</p>
        </div>
      </div>
      <div class="col-4">
        <div class="card">
          <div class="card__math">
            <p class="card__figure--income">+ ¥33,500</p>
            <p class="card__figure--outcome">- ¥16,500</p>
          </div>
          <h3 class="title">¥0,000</h3>
          <p class="subtitle">Today</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.card {
  &__math {
    padding-top: 16px;

    p {
      text-align: center;
      margin: 0;
    }
  }
}
</style>
