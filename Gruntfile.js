/* 
 * @copyright 2014 CoNWeT Lab., Universidad Politécnica de Madrid
 * @license Apache v2 (http://www.apache.org/licenses/)
 */

module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    isDev: grunt.option('target') === 'release' ? '' : '-dev',
    isTest: grunt.option('test'),

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

    copy: {
      main: {
        files: [
          {expand: true, src: ['**/*', '!test/**'], dest: 'build/wgt', cwd: 'src'},
          {expand: true, src: ['jquery.min.map', 'jquery.min.js'], dest: 'build/wgt/lib/js', cwd: 'node_modules/jquery/dist'}
        ]
      }
    },
    
    jasmine: {
      test: {
        src: ['src/js/*.js'],
        options: {
          specs: 'src/test/js/*Spec.js',
          helpers: ['src/test/helpers/*.js'],
          vendor: ['node_modules/jquery/dist/jquery.js',
            'src/lib/js/jquery.dataTables.js',
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
          to: '<script type="text/javascript"> var MashupPlatform = {widget: {context: {registerCallback: function (){} } } }; </script><script src="StyledElements/Utils.js"></script> <script src="StyledElements/Event.js"></script> <script src="StyledElements/ObjectWithEvents.js"></script> <script src="StyledElements/StyledElements.js"></script> <script src="StyledElements/InputElement.js"></script> <script src="StyledElements/CommandQueue.js"></script> <script src="StyledElements/Container.js"></script> <script src="StyledElements/Addon.js"></script> <script src="StyledElements/Accordion.js"></script> <script src="StyledElements/Expander.js"></script> <script src="StyledElements/Fragment.js"></script> <script src="StyledElements/PaginatedSource.js"></script> <script src="StyledElements/GUIBuilder.js"></script> <script src="StyledElements/Tooltip.js"></script> <script src="StyledElements/Button.js"></script> <script src="StyledElements/PopupMenuBase.js"></script> <script src="StyledElements/PopupMenu.js"></script> <script src="StyledElements/DynamicMenuItems.js"></script> <script src="StyledElements/MenuItem.js"></script> <script src="StyledElements/Separator.js"></script> <script src="StyledElements/SubMenuItem.js"></script> <script src="StyledElements/PopupButton.js"></script> <script src="StyledElements/StaticPaginatedSource.js"></script> <script src="StyledElements/FileField.js"></script> <script src="StyledElements/NumericField.js"></script> <script src="StyledElements/TextField.js"></script> <script src="StyledElements/TextArea.js"></script> <script src="StyledElements/StyledList.js"></script> <script src="StyledElements/PasswordField.js"></script> <script src="StyledElements/Select.js"></script> <script src="StyledElements/ToggleButton.js"></script> <script src="StyledElements/Pills.js"></script> <script src="StyledElements/Tab.js"></script> <script src="StyledElements/StyledNotebook.js"></script> <script src="StyledElements/Alternative.js"></script> <script src="StyledElements/Alternatives.js"></script> <script src="StyledElements/HorizontalLayout.js"></script> <script src="StyledElements/BorderLayout.js"></script> <script src="StyledElements/ModelTable.js"></script> <script src="StyledElements/EditableElement.js"></script> <script src="StyledElements/HiddenField.js"></script> <script src="StyledElements/ButtonsGroup.js"></script> <script src="StyledElements/CheckBox.js"></script> <script src="StyledElements/RadioButton.js"></script> <script src="StyledElements/InputInterface.js"></script> <script src="StyledElements/InputInterfaces.js"></script> <script src="StyledElements/VersionInputInterface.js"></script> <script src="StyledElements/InputInterfaceFactory.js"></script> <script src="StyledElements/DefaultInputInterfaceFactory.js"></script> <script src="StyledElements/Form.js"></script> <script src="StyledElements/PaginationInterface.js"></script> <script src="StyledElements/Popover.js"></script><script src="js/dataViewer.js"></script>'
        }, {
          from: '<link rel="stylesheet" type="text/css" href="css/style.css">',
          to: '<link rel="stylesheet" type="text/css" href="css/wirecloud.css"><link rel="stylesheet" type="text/css" href="css/style.css">'
        }]
      }
    },

    clean: ['build'],

    jshint: {
      files: ['src/js/**/*', 'src/test/**/*'],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
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

  grunt.registerTask('wirecloudStyle', 'Loads StyledElements in index.html', function () {
    if (grunt.config.data.isTest) {
      grunt.task.run('replace:style');
    }
  });

  grunt.registerTask('package', ['gitinfo', 'manifest', 'copy', 'compress:widget']);

  grunt.registerTask('default', [/*'jshint',*/ 'replace:version', /*'jasmine:coverage',*/ 'package', 'wirecloudStyle']);
};
