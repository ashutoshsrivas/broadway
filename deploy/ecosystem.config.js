// pm2 process definition for the Next.js standalone server.
//
//   pm2 start deploy/ecosystem.config.js && pm2 save
//
// `next build` with output:"standalone" emits .next/standalone/server.js, which
// carries its own minimal node_modules — so production never needs the full
// dependency tree installed.
module.exports = {
  apps: [
    {
      name: "broadway",
      cwd: "/var/www/broadway",
      script: ".next/standalone/server.js",
      instances: 1, // single 2-vCPU, 908 MB box: cluster mode would just thrash
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1", // nginx is the only thing that should reach it
      },
      max_memory_restart: "480M",
      autorestart: true,
      // Keep the log from filling a 28 GB disk over months of uptime.
      max_size: "10M",
      error_file: "/var/log/broadway/error.log",
      out_file: "/var/log/broadway/out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
