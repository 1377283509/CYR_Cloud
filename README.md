<a href="https://github.com/TencentCloudBase/cloudbase-templates"><img src="https://main.qcloudimg.com/raw/7b50431d8cef29d9ebb82c4ff2e6032c.png"></a>

# 卒中中心信息采集系统服务端

[卒中中心信息采集系统APP端](https://github.com/1377283509/CYR)

[![](https://main.qcloudimg.com/raw/67f5a389f1ac6f3b4d04c7256438e44f.svg)](https://console.cloud.tencent.com/tcb/env/index?action=CreateAndDeployCloudBaseProject&appUrl=https%3A%2F%2Fgithub.com%2F1377283509%2FCYR_Cloud.git&branch=main)

## 部署

### 步骤一. 准备工作

具体步骤请参照 [准备云开发环境和 CloudBase CLI 命令工具](https://github.com/TencentCloudBase/cloudbase-framework/blob/master/CLI_GUIDE.md)

### 步骤二. 下载源码

```
git clone https://github.com/1377283509/CYR_Cloud.git
```

### 步骤三. 一键部署

1.  修改修改cloudbaserc.json, 将envId改为自己的云环境ID。

2.  进入到项目目录，在命令行执行

    ```
    tcb framework deploy
    ```

### 步骤四.安装CMS拓展

在控制台安装CMS拓展，安装成功后，进入CMS，创建一个项目，将项目目录下的schemas.json导入到该项目的模型中即可。

