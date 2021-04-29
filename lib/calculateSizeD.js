//Node modules
const {execSync} = require('child_process');


const calculateSizeD = function(itemFullStaticPath){
    //Escape spaces, tabs, etc.
    const itemFullStaticPathCleaned = itemFullStaticPath.replace(/\s/g,'\ ');

    const commandOutput = execSync(`du -sh "${itemFullStaticPathCleaned}"`).toString();

    let filesize = commandOutput.replace(/\s/g,'').replace("C:", '');
    filesize = filesize.split('/')[0];

    //Units
    const filesizeUnit = filesize.replace(/\d|\./g, '');
    
    //Size Number
    const filesizeNumber = filesize.replace(/[a-z]/i,'');

    //Convert to Bytes

    const units = "BKMGT";
    const filesizeBytes = filesizeNumber * Math.pow(1000, units.indexOf(filesizeUnit));

    return[filesize, filesizeBytes];
};

//File Exports
module.exports = calculateSizeD;