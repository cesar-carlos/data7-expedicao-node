module.exports = {
  apps: [
    {
      name: 'expedicao',
      script: './dist.loja/src/server.js',
      cwd: './dist.loja/src',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
    },
  ],
};
