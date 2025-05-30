const sharp = require('sharp');


/* this function takes in the file buffer ,file type and other options
Other options include file dimensions (if it is image or video based) and the required final size
the function returns the buffer with the compressed size */
async function compressFile(fileBuffer,fileType,options) {

    if(fileType.startsWith('image')) {
        let imageBuffer=fileBuffer;

        const {finalSize}=options; //quality is in percentage and finalSize is in Kb

        let currentSize=imageBuffer.length/1024; //this is the current size in Kb
        let quality=100;
        
        if(currentSize>finalSize) {
            imageBuffer=await sharp(imageBuffer).resize({width:100,height:100}).jpeg().toBuffer()
        }

        while(currentSize>finalSize&&quality>=70) {
            const compressedImageBuffer=await sharp(imageBuffer).jpeg({
                quality:quality,
                progressive:true,
                force:true
            }).toBuffer();

            currentSize=compressedImageBuffer.length/1024;
            quality-=10;
            imageBuffer=compressedImageBuffer;
        }
        return imageBuffer;
    }
    

    
}

module.exports={
    compressFile
}