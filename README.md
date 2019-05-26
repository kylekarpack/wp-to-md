# wp-to-md

This tool is designed to download rendered content from WordPress via the API and save it in a local directory as markdown and images. It's a simple solution for moving content from WordPress to a static site generator such as Jekyll, Hugo, Gatsby, or others.

## Installation

 ```
 $ npm i -g wp-to-md
 ``` 
 or 
 ```
 $ yarn global add wp-to-md
 ```


## Usage
```
$ wp-to-md [options]

Options:
  -V, --version        output the version number
  -u, --url <type>     WordPress API URL Base
  -o, --output <type>  Output directory (default: "./output")
  -t, --type <type>    Post type to process (default: "pages")
  -n, --number <type>  Maximum number of entries to process (default: 100)
  -h, --help           output usage information
```

## Development

1. Run ```yarn install``` or ```npm install``` to install dependencies
2. Run the utility with ```yarn start```/```npm start``` or ```node index.js```