import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
	// 主打包配置
	{
		input: 'src/index.ts',
		output: [{
				file: 'dist/index.cjs.js',
				format: 'cjs', // CommonJS 格式
				sourcemap: true
			},
			{
				file: 'dist/index.esm.js',
				format: 'esm', // ES Module 格式
				sourcemap: true
			},
			{
				file: 'dist/notp.umd.js',
				format: 'umd', // 通用模块定义
				name: 'notp', // 全局变量名
				sourcemap: true
			}
		],
		plugins: [
			resolve(), // 解析 node_modules 中的模块
			commonjs(), // 转换 CommonJS → ES6
			typescript() // 编译 TypeScript
		]
	},
	// 类型声明文件生成
	{
		input: 'src/index.ts',
		output: [{
			file: 'dist/index.d.ts',
			format: 'es'
		}],
		plugins: [dts()] // 生成 .d.ts 类型文件
	}
];