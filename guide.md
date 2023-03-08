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
hugo new content/en/post/test.md
```

## i18n check
```bash
hugo --printI18nWarnings | grep i18n
```
