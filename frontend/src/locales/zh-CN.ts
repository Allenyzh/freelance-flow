// 简体中文 locale messages
export default {
  // 通用
  common: {
    add: "添加",
    edit: "编辑",
    delete: "删除",
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    refresh: "刷新",
    loading: "加载中...",
    noData: "暂无数据",
    today: "今天",
    yesterday: "昨天",
    total: "合计",
    status: "状态",
    actions: "操作",
  },

  // 导航
  nav: {
    dashboard: "仪表盘",
    clients: "客户",
    projects: "项目",
    timesheet: "工时",
    invoices: "发票",
    reports: "报表",
    settings: "设置",
    help: "帮助",
  },

  // 主题
  theme: {
    switchToLight: "切换到浅色模式",
    switchToDark: "切换到深色模式",
  },

  // 底部状态栏
  footer: {
    statusBar: "状态栏：",
    weeklyHours: "本周工时：",
    pendingPayment: "待收款：",
  },

  // 工时
  timesheet: {
    title: "工时",
    subtitle: "记录和跟踪您的计费工时",
    logTime: "记录工时",
    noEntries: "暂无工时记录",
    noEntriesHint: "使用上方计时器或手动添加工时",
    thisWeek: "本周",
    // 计时器
    timer: {
      placeholder: "正在进行什么工作？",
      selectProject: "选择项目",
      start: "开始",
      stop: "停止",
      discard: "丢弃计时",
      discardedMsg: "计时已丢弃",
      loggedMsg: "工时记录成功！",
      selectProjectFirst: "请先选择一个项目",
    },
    // 快速录入
    quickEntry: {
      placeholder: "您完成了什么工作？",
      project: "项目",
      date: "日期",
      duration: "时长",
      durationHint: "提示：时长格式支持 {examples}",
      durationExamples: "1h、1h 30m、1.5 或 90m",
      invalidDuration: "请输入有效的时长格式（如 1h、1h 30m、1.5、90m）",
      selectProject: "请选择项目",
      enterDescription: "请输入工作描述",
      loggedMsg: "工时已记录！",
    },
    // 条目
    entry: {
      noProject: "无项目",
      invoiced: "已开票",
      continueTimer: "继续计时",
      editEntry: "编辑条目",
      deleteEntry: "删除条目",
      deleteConfirm: "确定删除此工时记录？",
      deletedMsg: "条目已删除",
      updatedMsg: "工时记录已更新",
    },
    // 表单弹窗
    form: {
      editTitle: "编辑工时记录",
      createTitle: "记录工时",
      project: "项目",
      date: "日期",
      duration: "时长（小时）",
      description: "工作描述",
      descriptionPlaceholder: "您完成了什么工作？",
      timeRange: "时间段（可选）",
      startTime: "开始时间",
      endTime: "结束时间",
      alreadyInvoiced: "已开票",
      update: "更新",
    },
  },

  // 客户
  clients: {
    title: "客户",
    subtitle: "管理您的客户关系",
    addClient: "添加客户",
    noClients: "暂无客户",
  },

  // 项目
  projects: {
    title: "项目",
    subtitle: "管理您的项目",
    addProject: "添加项目",
    noProjects: "暂无项目",
  },

  // 发票
  invoices: {
    title: "发票",
    subtitle: "管理您的发票",
    createInvoice: "创建发票",
    noInvoices: "暂无发票",
  },

  // 仪表盘
  dashboard: {
    title: "仪表盘",
    subtitle: "您的自由职业业务概览",
  },

  // 报表
  reports: {
    title: "报表",
    subtitle: "数据分析与洞察",
  },
};
