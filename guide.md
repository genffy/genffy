# dev guide

## requirement
update theme
```shell
git submodule update --init --recursive
git submodule update --remote --merge
```

## new post
- how use template
- how use i18n
```bash
hugo new content/en/posts/test.md
```

## i18n check
```bash
hugo --printI18nWarnings | grep i18n
```

## TODOs
- upload static file to cdn and replace with cdn url
