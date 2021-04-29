//Node modules
const fs = require('fs');
const path = require('path');

//File Imports
const calculateSizeD = require('./calculateSizeD.js');
const calculateSizeF = require('./calculateSizeF.js')

const buildMainContent = function(fullStaticPath, pathname){
    let mainContent = '';
    let items;
    try{
        items = fs.readdirSync(fullStaticPath);
    } catch (err){
        console.log(`readdirSync error: ${err}`);
        return `<div class = "alert alert-danger">Internal Server Error</div>`;
    }


    items.forEach(function(item,index){
        //Link
        const link = path.join(pathname,item);

        //Icon and Folder/File Size
        const itemFullStaticPath = path.join(fullStaticPath,item);
        let itemDetails = {};
        try{
            itemDetails.stats = fs.statSync(itemFullStaticPath);
        } catch (err){
            console.log(`statSync error: ${err}`);
            mainContent = `<div class = "alert alert-danger">Internal Server Error</div>`;
            return false;
        }

        if(itemDetails.stats.isDirectory()){
            itemDetails.icon = `<ion-icon name="folder-outline"></ion-icon>`;
            [itemDetails.size, itemDetails.sizeBytes] = calculateSizeD(itemFullStaticPath);
        } else if(itemDetails.stats.isFile()){
            itemDetails.icon = `<ion-icon name="document-outline"></ion-icon>`;
            [itemDetails.size, itemDetails.sizeBytes] = calculateSizeF(itemDetails.stats);
        }

        //Last Modified
        itemDetails.timeStamp = parseInt(itemDetails.stats.mtimeMs);

        //Convert timeStamp
        itemDetails.date = new Date(itemDetails.timeStamp);
        itemDetails.date = itemDetails.date.toLocaleString();

        //Main Content using Link, Icon, and date.
        mainContent += 
        //Set behind the scenes data-name, data-size, data-time.
        `<tr data-name="${item}" data-size = "${itemDetails.sizeBytes}" data-time = "${itemDetails.timeStamp}">
            <td><a href = "${link}">${itemDetails.icon} ${item}</a></td>
            <td>${itemDetails.size}</td>
            <td>${itemDetails.date}</td>
        </tr>
        `;
        
    });

    return mainContent;
};

//File Exports
module.exports = buildMainContent;