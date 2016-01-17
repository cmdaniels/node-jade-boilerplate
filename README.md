# Node Boilerplate (Jade)

## Features

- Gulp
  - Auto Compile
  - Uglify
  - Live Reload (requires live-reload browser extention)
  - Image Compression
  - Autoprefixer
  - Plumber/Notify
  - FTP Deploy
- Sass
- Jade
- jQuery
- NodeJS
- MongoDB
- Express
- Normalize.css

## Setup

1. install the prerequisites: NPM, Gulp
2. clone this repository to your local machine
3. `npm install`

## Gulp Processes

* `gulp`: starts the express and tiny-lr server. Refreshes the browsers automatically when you edit and save your sass, js, or jade files. Use this command while working on your project.
* `gulp clear`: deletes all files in your \_dist folder
* `gulp prod` or `gulp production`: generates and copies all the files you need for deployment into the \_dist folder, requires you to run `npm install --production` manually within the folder
* `gulp deploy`: uploads files in \_dist to your server using the configuration in gulpfile.js
