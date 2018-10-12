module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      build: {
        files: ["src/*.*"],
        tasks: ['build']
      }
    },
    less: {
      build: {
        src: 'src/app.less',
        dest: 'app/app.css'
      }
    },
    babel: {
      options: {
        sourceMap: false,
        presets: ['env']

      },
      dist: {
        files: [{
          expand: false,
          src: ['src/ai.js'], //所有js文件
          dest: 'src/ai-b.js' //输出到此目录下
        }]
      }
    },
    browserify: {
      build: {
        options: {
          alias: {
            jquery: './src/jquery.js'
          }
        },
        src: 'src/app.js',
        dest: "app/app.js"
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-less')
  grunt.loadNpmTasks('grunt-browserify')
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('build', ['babel', 'browserify'])
  grunt.registerTask('default', ['build'])
  //grunt.registerTask('default', ['watch']);
}