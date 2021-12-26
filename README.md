Create new EXPRESS app (https://expressjs.com/pt-br/starter/generator.html):

    $ npm install express-generator -g
    $ express --view=pug myapp
    $ npm install
    $ yarn start #(just for test)


Install nodemon for dev (nodemon restarts the server when some change is detected):
    
    $ npm install nodemon --save-dev 


Add the script option in 'packege.json' to run the server with nodemon:
    
    "start-dev": "nodemon ./bin/www"

Run the server with nodemon for dev:
    
    yarn start-dev

Create tables in database:
    
    node ./infra/tables.js
