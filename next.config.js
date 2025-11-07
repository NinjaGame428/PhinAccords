/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  sassOptions: {
    includePaths: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, 'node_modules/bootstrap/scss'),
    ],
    silenceDeprecations: ['legacy-js-api'],
  },
}

module.exports = nextConfig
