<template>
  <div>
      <h2>this is home</h2>
      <el-button @click="exit">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    exit(){
      window.sessionStorage.clear()
      this.$router.replace('/login')
    }
  }
}
</script>

<style>

</style>