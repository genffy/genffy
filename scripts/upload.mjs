import fs from 'node:fs'
import path from 'node:path'
import * as dotenv from 'dotenv'
dotenv.config()
import fg from 'fast-glob';
import OSS from 'ali-oss';
const { ALI_OSS_REGION, ALI_OSS_KEY_ID, ALI_OSS_KEY_SECRET, ALI_OSS_BUCKET } = process.env;
if (!ALI_OSS_REGION || !ALI_OSS_KEY_ID || !ALI_OSS_KEY_SECRET || !ALI_OSS_BUCKET) {
  throw Error('pls config oss');
}
// read config first
const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: ALI_OSS_REGION,
  // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: ALI_OSS_KEY_ID,
  accessKeySecret: ALI_OSS_KEY_SECRET,
  bucket: ALI_OSS_BUCKET,
});

// scan all `md` file collect `relative` static files
const folders = ['content', 'partials', 'archetypes', '__test__']
fg(folders.map(f => `${f}/**/*.md`), { dot: true }).then((entries) => {
  entries.forEach(md => {
    const filePath = `${process.cwd()}/${md}`;
    fs.readFile(filePath, (err, data) => {
      // if there's an error, log it and return
      if (err) {
        console.error(err)
        return
      }
      let content = data.toString();
      const matches = content.match(/(!\[.*?\]\()(.+?)(\))/g);
      if (matches) {
        const imagePaths = matches.map(match => match.match(/!\[.*?\]\((.*?)\)/)[1]);
        // upload it to cdn and replace it with CDN url
        imagePaths.forEach(async (file) => {
          const { url, res } = await client.put(path.basename(file), path.join(path.dirname(filePath), file)/** ,{headers} */);
          if (res && res.status === 200) {
            content = content.replace(new RegExp(file, 'g'), url);
            fs.writeFileSync(filePath, content);
          }
        })
      }
    })
  })
});
