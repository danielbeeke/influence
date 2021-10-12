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
    ],
    buildOptions: {
      out: 'docs'
    },
    optimize: {
      bundle: true,
      minify: true,
      target: 'es2018',
    },
  };