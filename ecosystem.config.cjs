/** PM2 配置：在服务器项目根目录执行 `pm2 start ecosystem.config.cjs` */
module.exports = {
  apps: [
    {
      name: "blessing",
      cwd: __dirname,
      script: ".next/standalone/server.js",
      instances: 1,
      autorestart: true,
      max_memory_restart: "400M",
      env_file: ".env",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "0.0.0.0",
        DATA_DIR: "/var/lib/blessing",
      },
    },
  ],
};
