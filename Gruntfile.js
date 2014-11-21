/**
 * @file Gruntfile.js
 * @version 0.0.1
 * 
 * @copyright 2014 CoNWeT Lab., Universidad Politécnica de Madrid
 * @license Apache v2 (https://github.com/Wirecloud/room-manager-src/blob/master/LICENSE)
 */

module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    banner: ' * @version <%= pkg.version %>\n' +
            ' * \n' +
            ' * @copyright 2014 <%= pkg.author %>\n' +
            ' * @license <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
            ' */',

    compress: {
      widget: {
        options: {
          mode: 'zip',
          archive: 'build/<%= pkg.vendor %>_<%= pkg.name %>_<%= pkg.version %>-dev.wgt'
        },
        files: [
          {expand: true, src: ['lib/**/*', 'config.xml', 'index.html'], cwd: 'src'},
          {expand: true, src: ['js/**/*', 'css/**/*'], cwd: 'build'},
          {expand: true, src: ['jquery.min.map', 'jquery.min.js'], dest: 'lib/js', cwd: 'node_modules/jquery/dist'}
        ]
      }
    },
    
    jasmine: {
      src: ['src/js/*.js'],
      options: {
        specs: 'src/test/js/*Spec.js',
        helpers: ['src/test/helpers/*.js'],
        vendor: ['node_modules/jquery/dist/jquery.js',
                'src/lib/js/jquery.dataTables.js',
                'node_modules/jasmine-jquery/lib/jasmine-jquery.js']
      }
    },

    replace: {
      version: {
        src: ['src/config.xml'],
        overwrite: true,
        replacements: [{
          from: /version=\"[0-9]+\.[0-9]+\.[0-9]+(-dev)?\"/g,
          to: 'version="<%= pkg.version %>"'
        }]
      }
    },

    clean: ['build'],

    jshint: {
      all: ['src/js/**/*', 'src/test/**/*', 'Gruntfile.js']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('js', ['concat:dist', 'uglify:dist']);
  grunt.registerTask('jsConcat', 'concat:dist');
  grunt.registerTask('css', ['less:dist', 'cssmin:dist']);
  grunt.registerTask('zip', 'compress:widget');
  grunt.registerTask('version', ['replace:version']);

  // grunt.registerTask('default', ['jshint', 'js', 'css', 'version', 'jasmine', 'zip']);
  grunt.registerTask('default', ['jshint', 'jsConcat', 'css', 'version', 'jasmine', 'zip']);
};
