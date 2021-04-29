//Node modules
const url = require('url');
const path = require('path');
const fs = require('fs');

//File imports
const buildBreadCrumb = require('./breadcrumb.js');
const buildMainContent = require('./mainContent.js');
const getMimeType = require('./getMimeType.js');

//Static base path
const staticBasePath = path.join(__dirname,'..','static')

//Respond to a request
//Function is passed to createServer used to create the server.
const respond = function(request,response){

    //Decode pathname
    //request.url returns / because path of localhost:3000 is directory of app.js
    const myUrl = new URL(request.url,'http://localhost:3000/');
    let pathname = myUrl.pathname;

    if(pathname === '/favicon.ico'){
        return false;
    }

    pathname = decodeURIComponent(pathname);

    //Get corresponding full static path
    const fullStaticPath = path.join(staticBasePath,pathname);
    
    //Return error if file not in static
    if (!fs.existsSync(fullStaticPath)){
        console.log(`${fullStaticPath} does not exist`);
        response.write("404: File not found");
        response.end();
        return false;
    } 

    //If found
    let stats;
    try{
        stats = fs.lstatSync(fullStaticPath); 
    } catch (err){
        console.log(`lstatSync Error: ${err}`);
    }

    //If directory:
    if(stats.isDirectory()){
        //Read index.html
        let data = fs.readFileSync(path.join(staticBasePath, 'project_files/index.html'), 'utf-8');

        //Build page title
        let pathElements = pathname.split('/').reverse().filter(element => element !== '');
        const folderName = pathElements[0];

        //Show path inside Breadcrumb
        const breadcrumb = buildBreadCrumb(pathname);

        //Build Table
        const mainContent = buildMainContent(fullStaticPath, pathname);

        //Fill template with data, breadcrumb, and table content
        data = data.replace('page_title', folderName);
        data = data.replace('pathname', breadcrumb);
        data = data.replace('mainContent', mainContent);

        //Print data to the webpage
        response.statusCode = 200;
        response.write(data);
        return response.end();
    }

    //If not directory or file
    if(!stats.isFile()){
        response.statusCode = 401;
        response.write("401: Access Denied!");
        console.log("Not a file!");
        return response.end();
    }


    //If file
    let fileDetails = {};

    //Get extension name of file
    fileDetails.extname = path.extname(fullStaticPath);

    //file size
    let stat;
    try{
        stat = fs.statSync(fullStaticPath);
    }catch(err){
        console.log(`error: ${err}`);
    }
    fileDetails.size = stat.size;


    //Get mime type and add to response header
    getMimeType(fileDetails.extname).then(mime => {
        //Store headers
        let head = {};
        let options = {};
        
        //Response status code
        let statusCode = 200;

        //Set "Content-Type" for all file types
        head['Content-Type'] = mime;

        //PDFs
        if(fileDetails.extname === '.pdf'){
            head['Content-Disposition'] = 'inline';
        }
        
        //Audio/Videos
        if(RegExp('audio').test(mime) || RegExp('video').test(mime)){
            //Header
            head['Accept-Ranges'] = 'bytes';

            const range = request.headers.range;

            if(range){
                const start_end = range.replace(/bytes=/, "").split('-');
                const start = parseInt(start_end[0]);
                const end = start_end[1] ? parseInt(start_end[1]): fileDetails.size - 1;

                //Headers
                //Content-Range
                head['Content-Range'] = `bytes ${start}-${end}/${fileDetails.size}`;
                //Content-Length
                head['Content-Length'] = end - start + 1;
                statusCode = 206;
                
                //options
                options = {start, end};
            }
            
        }

        //All other files stream normal.
        //File Stream
        const fileStream = fs.createReadStream(fullStaticPath, options);
        
        //Stream chunks to response
        response.writeHead(statusCode, head);
        fileStream.pipe(response);

        //Events: Close and Error
        fileStream.on('close', () =>{
            return response.end();
        });

        fileStream.on('error', error => {
            response.statusCode = 404;
            response.write('404: File Stream Error');
            console.log(error.code);
            return response.end();
        });

    }).catch (err => {
        response.statusCode = 500;
        response.write('500: Internal Server Error!');
        console.log(`Promise Error: ${err}`);
        return response.end();
    })
    
}
module.exports = respond;