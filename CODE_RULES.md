# Code Rules

以后每次修改代码前，先按本文件规则检查修改方案和最终代码。

## App.vue 规则

`src/App.vue` 默认只放最基本的页面框架和组件装配。

允许保留：

- 页面最外层结构
- 根组件引入
- 少量用于连接子组件的状态引用
- 子组件之间必要的事件转发

不允许放入：

- 大段业务逻辑
- 搜索、跳转、定位、返回等功能函数主体
- 大型常量对象
- 文案配置
- 复杂 DOM 操作
- 可复用组件定义

这些内容必须移动到对应文件夹：

- 通用函数放到 `src/utils/`
- 页面状态和组合逻辑放到 `src/composables/`
- 独立 UI 放到 `src/components/`
- 文案配置放到 `src/config/`
- 样式放到 `src/styles/`

## 可读性规则

代码必须优先保证可读性。

- 文件名使用英文，并按功能命名。
- 单个文件只负责一个清晰功能。
- 复杂功能拆成小函数、小组件或 composable。
- 避免把无关逻辑塞进同一个文件。
- 修改前先理解现有结构，优先沿用已有目录和命名方式。

## 编码规则

最终生成的代码里不允许出现 Unicode 转义文案。

应该直接写可读文本，例如：

```js
zh: '搜索结果'
ko: '검색 결과'
```

不允许为了规避编码问题，把中文、韩文、日文写成反斜杠加字母 u 的编码形式。

也不允许因为编码问题生成乱码文案。发现乱码必须立刻修复。

## 交互入口统一规则

同一个用户功能必须走同一套状态函数和业务函数，不允许电脑端、手机端、图标点击、回车提交分别写不同逻辑。

例如：

- 搜索：点击搜索图标、电脑端 Enter、移动端键盘搜索键，都必须触发同一个 submit/search 函数。
- 菜单：顶部打开按钮、遮罩关闭按钮、侧边栏收起按钮，都必须调用同一组 sidebar open/close/toggle 函数。
- 跳转：搜索结果跳转、目录跳转、内部链接跳转，如果行为一致，应复用同一个导航函数或在 composable 中收敛。

组件模板只负责触发事件；状态修改和业务流程必须收敛到对应 composable，避免在 `App.vue` 或组件模板里直接写多份状态赋值。

## 修改后检查

每次代码修改后至少检查：

- `App.vue` 是否仍然只承担页面框架职责
- 是否有逻辑应该移动到 `utils`、`composables`、`components` 或 `config`
- 是否存在反斜杠加字母 u 的 Unicode 转义文案
- 是否存在乱码中文、韩文或日文
- 是否能通过 `npm run build`

## 文件读取规则

本项目包含大量中文、韩文和日文。以后读取或检查文本文件时，默认不要用普通 PowerShell `Get-Content` 判断文本是否乱码，因为它可能把 UTF-8 显示成假乱码。

优先使用 Node 按 UTF-8 读取文件，例如：

```js
const fs = await import('node:fs')
const text = fs.readFileSync('文件路径', 'utf8')
```

如果必须使用 PowerShell，先设置 UTF-8 输出环境：

```powershell
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
```

检查乱码时，优先使用 Node 或构建结果验证，不要只凭 PowerShell 控制台显示判断。
