export default {
    mount: {
        "src": "/"
    },
    routes: [
      {
        match: 'routes',
        src: '.*',
        dest: '/index.html',
      },
    ],
    plugins: [
      '@snowpack/plugin-sass'
    ]
  };