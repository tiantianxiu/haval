Component({
  properties: {
    totalPage: {
      type: Number,
      value: 0,
    },
    currentPage: {
      type: Number,
      value: 0,      
    },
    bottom: {
      type: Number,
      value: 0,        
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {}
  },
  methods: {
    // 这里是一个自定义方法
    setCurrentPage: function(e){
      const idx = e.currentTarget.dataset.idx
      this.triggerEvent('changePage', e.currentTarget.dataset.idx)
    }
  }
})