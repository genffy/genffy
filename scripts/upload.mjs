// WIP: upload all images to oss
import fs from 'node:fs'
import path from 'node:path'
import * as dotenv from 'dotenv'
import fg from 'fast-glob';
import OSS from 'ali-oss';

dotenv.config()

const { ALI_OSS_REGION, ALI_OSS_KEY_ID, ALI_OSS_KEY_SECRET, ALI_OSS_BUCKET, ALI_OSS_DOMAIN } = process.env;

if (!ALI_OSS_REGION || !ALI_OSS_KEY_ID || !ALI_OSS_KEY_SECRET || !ALI_OSS_BUCKET) {
  throw Error('pls config oss');
}
// read config first
const client = new OSS({
  region: ALI_OSS_REGION,
  accessKeyId: ALI_OSS_KEY_ID,
  accessKeySecret: ALI_OSS_KEY_SECRET,
  bucket: ALI_OSS_BUCKET,
  secure: true,
});

// scan all `md` file collect `relative` static files
const folders = ['content', 'partials', 'archetypes']
fg(folders.map(f => `${f}/**/*.md`), { dot: true }).then((entries) => {
  entries.forEach(md => {
    const filePath = `${process.cwd()}/${md}`;
    fs.readFile(filePath, async (err, data) => {
      // if there's an error, log it and return
      if (err) {
        console.error(err)
        return
      }
      let content = data.toString();
      // get content images
      const imagePaths = getAllImagesPathFromMarkdownContentStartWithRelativePath(content);
      console.log(imagePaths)
      if (imagePaths && imagePaths.length > 0) {
        // upload it to cdn and replace it with CDN url
        imagePaths.forEach(async (imgPath) => {
          let { url, res } = await client.put(`blog/${path.basename(imgPath)}`, path.join(path.dirname(filePath), imgPath)/** ,{headers} */);
          if (ALI_OSS_DOMAIN) {
            url = url.replace(`${ALI_OSS_BUCKET}.${ALI_OSS_REGION}.aliyuncs.com`, ALI_OSS_DOMAIN)
          }
          if (res && res.status === 200) {
            content = content.replace(new RegExp(imgPath, 'g'), url);
            fs.writeFileSync(filePath, content, "utf8");
          }
        })
      }
      // get meta image
      const metaImagePath = getImagePathFromStringStartWithImages(content);
      if (metaImagePath) {
        const imgPath = path.join(`${process.cwd()}/static/`, metaImagePath)
        // upload it to cdn and replace it with CDN url
        let { url, res } = await client.put(`blog/${path.basename(imgPath)}`, imgPath);
        if (ALI_OSS_DOMAIN) {
          url = url.replace(`${ALI_OSS_BUCKET}.${ALI_OSS_REGION}.aliyuncs.com`, ALI_OSS_DOMAIN)
        }
        if (res && res.status === 200) {
          content = content.replace(new RegExp(metaImagePath, 'g'), url);
          fs.writeFileSync(filePath, content, "utf8");
        }
      }
    })
  })
});

function getImagePathFromStringStartWithImages(str) {
  const regex = /image: "(images\/.*?)"/g;
  const matches = regex.exec(str);
  if (matches && matches.length > 1) {
    return matches[1];
  }
  return null;
}


function getAllImagesPathFromMarkdownContentStartWithRelativePath(str) {
  const regex = /!\[.*?\]\((\.\.\/.*?)\)/g;
  const matches = str.match(regex);
  if (matches && matches.length > 1) {
    return matches;
  }
  return null;
}
