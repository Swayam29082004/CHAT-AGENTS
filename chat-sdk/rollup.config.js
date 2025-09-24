import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import terser from '@rollup/plugin-terser';
import { readFileSync } from 'fs';

// This line requires you to run `npm install --save-dev @types/node` in the chat-sdk folder
// if you haven't already. Or you can manually copy the package name.
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const rollupConfig = {
  input: 'src/index.ts',
  // Externalize React to prevent bundling it
  external: ['react', 'react-dom', 'react-dom/client'],
  
  // Shared plugins for all output formats
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    postcss({
      extract: 'style.css', // Extracts CSS to dist/style.css
      minimize: true,
    }),
  ],

  output: [
    // 1. CommonJS (for Node.js)
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
    },
    // 2. ES Module (for bundlers like Webpack, Vite)
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
    // 3. UMD (for browser <script> tags)
    {
      file: 'dist/chat-sdk.umd.js',
      format: 'umd',
      sourcemap: true,
      name: 'MyChatAgentSDK', // This becomes the global variable
      globals: {
        'react': 'React',
        'react-dom/client': 'ReactDOM',
      },
      // ✅ THE FIX: Apply the terser plugin ONLY to this UMD output
      plugins: [
        terser() 
      ]
    },
  ],
};

export default rollupConfig;

