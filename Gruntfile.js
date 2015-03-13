/* 
 * @copyright 2014 CoNWeT Lab., Universidad Politécnica de Madrid
 * @license Apache v2 (http://www.apache.org/licenses/)
 */

module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    isDev: grunt.option('target') === 'release' ? '' : '-dev',

    banner: ' * @version <%= pkg.version %>\n' +
            ' * \n' +
            ' * @copyright 2014 <%= pkg.author %>\n' +
            ' * @license <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
            ' */',

    compress: {
      widget: {
        options: {
          archive: 'build/<%= pkg.vendor %>_<%= pkg.name %>_<%= pkg.version %><%= isDev %>.wgt',
          mode: 'zip',
          level: 9,
          pretty: true
        },
        files: [
          {expand: true, src: ['**/*'], cwd: 'build/wgt'}
        ]
      }
    },

    concat: {
      dist: {
        src: grunt.file.readJSON("src/test/fixtures/html/wirecloudStyleDependencies.html"),
        dest: "build/helpers/StyledElements.js"
      }
    },

    copy: {
      main: {
        files: [
          {expand: true, src: ['**/*', '!test/**'], dest: 'build/wgt', cwd: 'src'},
          {expand: true, src: ['jquery.min.map', 'jquery.min.js'], dest: 'build/wgt/lib/js', cwd: 'node_modules/jquery/dist'},
          {expand: true, src: ['bootstrap.min.css', 'bootstrap.css.map', 'bootstrap-theme.min.css', 'bootstrap-theme.css.map'], dest: 'build/wgt/lib/css', cwd: 'node_modules/bootstrap/dist/css'},
          {expand: true, src: ['bootstrap.min.js'], dest: 'build/wgt/lib/js', cwd: 'node_modules/bootstrap/dist/js'},
          {expand: true, src: ['*'], dest: 'build/wgt/lib/fonts', cwd: 'node_modules/bootstrap/dist/fonts'},
          {expand: true, src: ['css/jquery.dataTables.min.css', 'js/jquery.dataTables.min.js', 'images/*'], dest: 'build/wgt/lib', cwd: 'node_modules/datatables/media'},
          {expand: true, src: ['css/font-awesome.min.css', 'fonts/*'], dest: 'build/wgt/lib', cwd: 'node_modules/font-awesome'}
        ]
      }
    },
    
    jasmine: {
      test: {
        src: ['src/js/*.js', '!src/js/main.js'],
        options: {
          specs: 'src/test/js/*Spec.js',
          helpers: ['src/test/helpers/*.js', 'build/helpers/*.js'],
          vendor: ['src/test/vendor/*.js',
            'node_modules/jquery/dist/jquery.js',
            'node_modules/datatables/media/js/jquery.dataTables.js',
            'src/lib/js/dataTables.fixedHeader.js',
            'node_modules/jasmine-jquery/lib/jasmine-jquery.js']
        }
      },

      coverage: {
        src: '<%= jasmine.test.src %>',
        options: {
          helpers: '<%= jasmine.test.options.helpers %>',
          specs: '<%= jasmine.test.options.specs %>',
          vendor: '<%= jasmine.test.options.vendor %>',
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions : {
            coverage: 'build/coverage/json/coverage.json',
            report: [
              {type: 'html', options: {dir: 'build/coverage/html'}},
              {type: 'cobertura', options: {dir: 'build/coverage/xml'}},
              {type: 'text-summary'}
            ]
          }
        }
      }
    },

    replace: {
      version: {
        src: ['src/config.xml'],
        overwrite: true,
        replacements: [{
          from: /version="[0-9]+\.[0-9]+\.[0-9]+(-dev)?"/g,
          to: 'version="<%= pkg.version %>"'
        }]
      },

      style: {
        src: ['build/wgt/index.html'],
        overwrite: true,
        replacements: [{
          from: '<script src="js/dataViewer.js"></script>',
          to: grunt.file.read("src/test/helpers/Wirecloud_JS-Style_Imports.txt")
        }, {
          from: '<link rel="stylesheet" type="text/css" href="css/style.css">',
          to: '<link rel="stylesheet" type="text/css" href="css/wirecloud.css"><link rel="stylesheet" type="text/css" href="css/style.css">'
        }]
      }
    },

    clean: ['build'],


    jshint: {
        options: {
            jshintrc: true
        },
        all: {
            files: {
                src: ['src/js/**/*.js']
            }
        },
        grunt: {
            options: {
                jshintrc: '.jshintrc-node'
            },
            files: {
                src: ['Gruntfile.js']
            }
        },
        test: {
            options: {
                jshintrc: '.jshintrc-jasmine'
            },
            files: {
                src: ['src/test/**/*.js', '!src/test/fixtures/', '!src/test/StyledElements/*']
            }
        }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-gitinfo');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('manifest', 'Creates a manifest.json file', function() {

    this.requiresConfig('gitinfo');
    var current = grunt.config(['gitinfo', 'local', 'branch', 'current']);
    var content = JSON.stringify({
      'Branch': current.name,
      'SHA': current.SHA,
      'User': current.currentUser,
      'Build-Timestamp': grunt.template.today('UTC:yyyy-mm-dd HH:MM:ss Z'),
      'Build-By' : 'Grunt ' + grunt.version
    }, null, '\t');
    grunt.file.write('build/wgt/manifest.json', content);
  });

  grunt.registerTask('package', ['gitinfo', 'manifest', 'copy', 'compress:widget']);
  grunt.registerTask('test', ['concat', 'jasmine:coverage']);
  grunt.registerTask('default',
    [
    'jshint',
    'test',
    'replace:version',
    'package'
    ]);
};