//Node modules
const fs = require('fs');


const calculateSizeF = function(stats){
    const filesizeBytes = stats.size;
    const units = 'BKMGT'

    const index = Math.floor(Math.log10(filesizeBytes)/3);
    const filesize = (filesizeBytes/Math.pow(1000,index).toFixed(1));
    const unit = units[index];
    const convertedfilesize = `${filesize}${unit}`;


    return[convertedfilesize, filesizeBytes];
};

//File Exports
module.exports = calculateSizeF;