# 金秀贤事件澄清网站

一个由 `site_data.json` 驱动的 Vue 3 单页网站。进入网站后直接展示司法进展时间线，其他资料通过左侧菜单查看。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## 更新内容

直接修改项目根目录的 `site_data.json`。页面支持：

- `timeline`：时间线
- `comparison`：对比表
- `list`：资料列表
- `two-level`：二级菜单
- `matrix`：矩阵表格

`label` 与 `imgs` 会按照当前的 `zh`、`ko`、`en` 语言显示；`imgs.shared` 中的图片会在所有语言下显示。
# ksh_truth1.2
