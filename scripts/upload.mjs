import fs from 'node:fs'
import * as dotenv from 'dotenv'
dotenv.config()
import fg from 'fast-glob';
// read config first
console.log(process.env.CDN_APP_KEY, process.env.CDN_APP_TOKEN)
// scan all `md` file collect `relative` static files
const folders = ['content', 'partials', 'archetypes']
const IMAGE_REGX = /\]\((.+)(?=(\.(svg|gif|png|jpe?g)))/g
fg(folders.map(f=>`${f}/**/*.md`), { dot: true }).then((entries)=>{
    entries.forEach(path=>{
        const filePath = `${process.cwd()}/${path}`;
        console.log('filePath', filePath)
        // fs.readFile takes the file path and the callback
        fs.readFile(filePath, (err, data) => {
            // if there's an error, log it and return
            if (err) {
                console.error(err)
                return
            }
            // const files = data.toString().matchAll(IMAGE_REGX);
            // console.log(files)
            // Print the string representation of the data
            // const replacedText = data.toString().replace(IMAGE_REGX, (fullResult, imagePath) => {
            //     const newImagePath = url.resolve('http://www.example.org', imagePath)
            //     return `](${newImagePath}`;
            // })
        })
        // 
        // content = content.replace(
        //     '](' + matches[2],
        //     `](/images/${slug}/${matches[2].replace(/ /g, '-').replace(/\//g, '')}`
        // )
        // const replacedText = data.toString().replace(regex, (fullResult, imagePath) => {
        //     const newImagePath = url.resolve('http://www.example.org', imagePath)
        //     return `](${newImagePath}`;
        // })
    })
});
    
// upload it to cdn and replace it with CDN url

// done!