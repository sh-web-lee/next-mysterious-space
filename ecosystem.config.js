module.exports = {
  apps: [
    {
      name: "mysterious-space",
      script: "node_modules/.bin/next",
      args: "start -p 8080",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      // 自动重启
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      // 日志
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
