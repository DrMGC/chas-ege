'use strict';

var fs = require('fs');
var ls = require('ls');
var regexp = require('node-regexp');

var exec = require('child_process').exec;

var libListChasUijs = require('./lib/load.js');
var libListChasLib  = require('./lib/load-chas-lib.js');
var pak             = require('./src/util/pak.js');


module.exports = function(grunt) {
	var cwd = process.cwd();

	var packCppTasks = function() {
		var tasks = ls('zdn/*/*/*.cpp');
		for (var i = 0; i < tasks.length; i++) {
			//Используем синхронное чтение/запись. Ибо вдруг дескрипторов не хватит?
			fs.writeFileSync('dist/' + tasks[i].path + '/' + tasks[i].name + '.js',
				'"use strict";\n(function(){chas2.task.setJscppTask("' +
				fs.readFileSync(tasks[i].full, 'utf8')
					.replace(/\\/g, '\\\\')
					.replace(/\'/g, '\\\'')
					.replace(/[\n\r]+/g, '\\n') +
				'");})();\n'
			);
		}
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		swigtemplates: {
			options: {
				defaultContext: {
					'version': '<%= pkg.version %>',
					'version_cache': new Date().getTime(),
				},
				templatesDir: 'sh/',
			},
			sh: {
				dest: 'build/sh/',
				src: ['sh/*.html'],
			},
			doc: {
				dest: 'build/doc/',
				src: ['doc/*.html'],
			},
			html: {
				dest: 'build/c2/',
				src: ['c2/*.html', '!c2/templ-*.html'],
			},
			unitTest: {
				dest: 'build/test/',
				src: ['test/*.html', '!test/templ-*.html'],
			}
		},
		copy: {
			pagesJs: {
				files: [
					{ expand: true, src: ['sh/*.js', 'c2/*.js'], dest: 'dist/' },
				]
			},
			taskSets: {
				files: [
					{ expand: true, src: ['zdn/**'], dest: 'dist/' },
				]
			},
			css: {
				files: [
					{ expand: true, src: ['css/**.css'], dest: 'dist/' },
				]
			},
			lib: {
				files: [
					{ expand: true, src: ['lib/**', 'src/**'], dest: 'dist/' },
				]
			},
			externals: {
				files: [
					{ expand: true, src: ['ext/**'], dest: 'dist/' }
				]
			},
			other: {
				files: [
					{ expand: true, src: ['index.html'], dest: 'dist/' },
				]
			},
			unitTest: {
				files: [
					{ expand: true, src: ['test/*.js'], dest: 'build/' },
				]
			},
		},
		concat: {
			options: {
				reload: true,
				separator: '\n;;;\n'
			},
			chasLib: {
				src: libListChasLib.libList,
				dest: 'build/lib/chas-lib.js'
			},
			chasUijs: {
				src: libListChasUijs.libList,
				dest: 'build/lib/chas-uijs.js'
			},
			init: {
				src: ['lib/init.js', 'build/lib/chas-uijs.js'],
				dest: 'build/lib/init.cat.js'
			},
		},
		uglify: {
			options: {
				screwIE8: true,
			},
			pagesJS: {
				files: [{
					expand: true,
					cwd: 'sh',
					src: '*.js',
					dest: 'dist/sh',
				}],
			},
			tasksPacks: {
				files: [{
					expand: true,
					cwd: 'build/zdn/',
					src: '*/upak.js',
					dest: 'dist/zdn',
				}]
			},
			head: {
				files: {
					'build/lib/head.min.js': ['lib/head.js'],
				}
			},
			chasLib: {
				files: {
					'dist/lib/chas-lib.min.js': ['build/lib/chas-lib.js'],
				}
			},
			chasUijs: {
				files: {
					'dist/lib/chas-uijs.min.js': ['build/lib/chas-uijs.js'],
				}
			},
			init: {
				files: {
					'dist/lib/init.min.js': ['build/lib/init.cat.js'],
				}
			},
		},
		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1,
			},
			target: {
				files: [
					{
						'dist/css/chas-ui.min.css': [
							 'css/browser.css',
							 'css/main.css',
							 'css/menu.css',
							 'ext/anyslider/css/anythingslider.css',
							 'ext/anyslider/css/theme-minimalist-square.css',
							 'ext/fonts/stylesheet.css',
							 'ext/keyboard/keyboard.css',
							 'ext/jqplot/jquery.jqplot.css',
						],
						'dist/css/chas-ui-bs.min.css': [
							 'css/browser.css',
							 'css/menu.css',
							 'ext/anyslider/css/anythingslider.css',
							 'ext/anyslider/css/theme-minimalist-square.css',
							 'ext/fonts/stylesheet.css',
							 'ext/keyboard/keyboard.css',
							 'ext/jqplot/jquery.jqplot.css',
							 'ext/bootstrap/css/bootstrap.min.css',
						],
					},
					{
						expand: true,
						cwd: 'css',
						src: ['*.css'],
						dest: 'dist/css',
						ext: '.min.css',
					}
				]
			},
		},
		htmlmin: {
			options: {
				removeComments: true,
				collapseWhitespace: true,
				conservativeCollapse: true,
				minifyJS: true,
				minifyCSS: true,
			},
			sh: {
				expand: true,
				cwd: 'build/',
				src: ['sh/*.html'],
				dest: 'dist/',
				ext: '.html'
			},
			doc: {
				expand: true,
				cwd: 'build/',
				src: ['doc/*.html'],
				dest: 'dist/',
				ext: '.html'
			},
			html: {
				expand: true,
				cwd: 'build/',
				src: ['c2/*.html'],
				dest: 'dist/',
				ext: '.html'
			}
		},

		checkPages: {
			dev: {
				options: {
					pageUrls: ls([
							'dist/c2/*.html',
							'dist/sh/*.html',
							'dist/doc/*.html'
						]).map(function(p) {
							return 'file://' + cwd + '/' + p.full;
						}),
					checkLinks: true,
					queryHashes: true,
					// noRedirects: true,
					noEmptyFragments: true,
					maxResponseTime: 200,
					summary: true
				}
			}
		},

		watch: {
			options: {
				reload: true
			},
			html: {
				files: [
					'doc/*.html',
					'c2/*.html',
					'lib/head.js',
					'sh/*.html',
				],
				tasks: ['process-html']
			},
			pagesJs: {
				files: [
					'doc/*.js',
					'c2/*.js',
					'sh/*.js',
				],
				tasks: ['process-pages-js']
			},
			lib: {
				files: [
					'lib/*', '!lib/head*',
					'src/**',
				],
				tasks: ['process-lib']
			},
			taskSets: {
				files: [
					'zdn/**',
				],
				tasks: ['process-task-sets']
			},
			css: {
				files: [
					'css/*',
				],
				tasks: ['process-css']
			},
			unitTest: {
				files: [
					'test/*'
				],
				tasks: ['process-unit-test']
			}
		},

		eslint: {
			options: {
				configFile: 'eslint.json'
			},
			target: [
				'src/*/*.js',
				'c2/*.js',
				'test/*.js',
				'Gruntfile.js'

				// Всё равно никто исправлять их не будет
				// ,'sh/*.js',
				// 'lib/*.js',
				// 'zdn/*/*/*.js'
			]
		},

		qunit: {
			all: ['build/test/*.html']
		},

		clean: {
			build: ['build/'],
			dist: ['dist/']
		}
	});

	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);

	//С make начинаются задания, результат которых - готовый *.min.{js,css}

	grunt.registerTask('unify-use-strict-chas-uijs', 'Убираем лишние use strict из chas-uijs.js', function() {
		exec('sed "1 a \'use strict\';//" build/lib/chas-uijs.js > build/lib/chas-uijs.js.tmp');
		exec('sed "/^.use strict.;$/d" build/lib/chas-uijs.js.tmp > dist/lib/chas-uijs.js');
		// exec('rm dist/lib/chas-uijs.js.tmp');
	});
	grunt.registerTask('packTasks', 'Упаковываем задания в соответствующие upak.js', function() {
		packCppTasks(cwd);
		// exec('cd dist && ../dev/upak.sh');
		pak.packZdnSync('zdn', 'build/zdn');
	});
	grunt.registerTask('make-init', ['concat:init', 'uglify:init']);
	grunt.registerTask('make-head', ['uglify:head']);
	grunt.registerTask('make-chas-lib', ['concat:chasLib', 'uglify:chasLib']);
	grunt.registerTask('make-chas-uijs', ['concat:chasUijs', /*'unify-use-strict-chas-uijs', 'uglify:chasUijs',*/]);

	grunt.registerTask('process-html', ['make-head', 'swigtemplates', 'htmlmin' ]);
	grunt.registerTask('process-pages-js', ['newer:copy:pagesJs']);
	grunt.registerTask('process-task-sets', ['packTasks', 'newer:copy:taskSets']);
	grunt.registerTask('process-lib', ['newer:copy:lib', 'make-chas-lib', 'make-chas-uijs', 'make-init']);
	grunt.registerTask('process-css', ['cssmin', 'newer:copy:css']);
	grunt.registerTask('process-unit-test', ['swigtemplates:unitTest', 'copy:unitTest']);

	grunt.registerTask('check-urls', ['checkPages:dev']);

	grunt.registerTask('build-except-ext', ['process-html', 'process-pages-js', 'process-task-sets', 'process-lib', 'process-css']);
	grunt.registerTask('default', ['build-except-ext', 'swigtemplates', 'copy', 'concat', 'uglify']);
};
