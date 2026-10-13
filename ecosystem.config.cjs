module.exports = {
  apps: [
    {
      name: 'qwertybot',
      script: './server/dist/index.js',
      cwd: '/root/qwertybot',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M'
    }
  ]
};
