# 快速上手

AnyWhere WorkStation 是面向 Apple Silicon Mac 的工作站管理应用，用来管理 Linux 虚拟机以及其中的文件、网络、浏览器、桌面、备份和恢复。

## 系统要求

- Apple Silicon（M 系列芯片）的 Mac

<!-- TODO: 补充最低 macOS 版本、磁盘空间和内存要求 -->

## 安装

<!-- TODO: 补充下载地址和安装步骤截图 -->

1. 下载安装包并拖入“应用程序”。
2. 首次打开时按提示[激活授权](./activation)。

## 创建第一台工作站

新建工作站会使用授权目录中的兼容组件。KDE 桌面、Chrome 和输入法作为桌面组件按需安装，不需要时可以不装。

新工作站使用 `/home/workstation` 作为家目录，不会预建 `code`、`work` 等业务目录，可以按自己的习惯建目录。

::: tip 新工作站默认不共享 Mac 目录
需要在 Mac 和工作站之间共享文件时，见[共享目录](../features/shares)。
:::

## 下一步

- [文件传输](../features/files)
- [终端与快捷键](../features/terminal)
