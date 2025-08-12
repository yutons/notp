# NOTP - One-Time Password Library

[](https://npmjs.org/package/notp)
[](https://github.com/yutons/notp/blob/main/LICENSE)
[](https://codecov.io/gh/yutons/notp)
[](https://npm-stat.com/charts.html?package=notp)
[](https://bundlephobia.com/package/notp)
[](https://github.com/yutons/notp/stargazers)

🔒 轻量级JavaScript库，实现**HOTP**(RFC 4226)和**TOTP**(RFC 6238)一次性密码算法，提供双因素认证(2FA)解决方案，兼容Google
Authenticator等主流验证器。

> **安全提示**
> - 🚨 **密钥存储**：禁止硬编码密钥，推荐使用环境变量或密钥管理服务
> - ⚠️ **算法选择**：SHA-1存在安全风险，高安全场景请使用SHA-256/SHA-512

## DEMO地址

[NOTP 动态口令生成器](https://notp.5567890.xyz/notp/docs/)

---

## 目录

- [核心特性](#核心特性)
- [安装指南](#安装指南)
- [快速开始](#快速开始)
- [API参考](#api参考)
- [算法支持](#算法支持)
- [兼容性](#兼容性)
- [贡献指南](#贡献指南)
- [常见问题](#常见问题)
- [许可证](#许可证)

---

## 核心特性

- 🔐 **标准化实现**  
  严格遵循 [RFC 4226](https://tools.ietf.org/html/rfc4226) (HOTP) 和 [RFC 6238](https://tools.ietf.org/html/rfc6238) (
  TOTP) 规范
- ⚡ **多环境支持**  
  Node.js | 浏览器  
  提供CommonJS、ES Module、UMD三种模块格式
- 🌐 **跨平台兼容**  
  ✅ Google Authenticator ✅ Microsoft Authenticator ✅ Authy
- 🛡️ **安全增强**  
  支持SHA-256/SHA-512哈希算法，提供验证窗口动态调整

[//]: # (- 📦 **零依赖**  )

[//]: # (  仅依赖原生Crypto API，体积<5KB（gzipped）)

---

## 安装指南

```bash
npm install notp
# 或者
yarn add notp
# 或者
pnpm add notp
```

````html
<!--浏览器安装-->
<script src="./dist/notp.min.js"></script>
````

---

## 快速开始

### 1. 生成TOTP验证码（Node.js）

```javascript
import {TOTP} from 'notp';
// 生成Base32密钥（实际使用应动态生成）
const secret = 'JBSWY3DPEHPK3PXP';
// 生成当前时间的一次性密码
const token = TOTP.generate({
    secret,
    algorithm: 'sha256' // 推荐使用SHA-256
});
console.log(`您的验证码：${token}`); // 输出示例: 123456
```

### 2. 验证TOTP令牌（浏览器）

```html

<script src="https://cdn.jsdelivr.net/npm/notp/dist/notp.umd.min.js"></script>
<script>
    const isValid = notp.TOTP.verify({
        token: document.getElementById('user-input').value,
        secret: 'JBSWY3DPEHPK3PXP',
        window: 3, // 允许3个时间窗口的容差
        algorithm: 'sha256'
    });
    alert(isValid.success ? '验证成功' : '验证码无效');
</script>
```

### 3. HOTP计数器应用场景

```javascript
// 用户注册时生成初始计数器
const userCounter = 1;

// 每次认证后更新计数器
function authenticate(userToken) {
    const result = HOTP.verify({
        token: userToken,
        secret: userSecret,
        counter: userCounter
    });
    if (result.success) {
        userCounter += result.delta + 1; // 更新计数器
        return true;
    }
    return false;
}
```

---

## API参考

### TOTP.generate(options)

| 参数          | 类型     | 必填 | 默认值        | 说明                                |
|-------------|--------|----|------------|-----------------------------------|
| `secret`    | string | ✓  | -          | Base32编码的密钥                       |
| `algorithm` | string | ✗  | sha1       | 哈希算法 (`sha1`, `sha256`, `sha512`) |
| `digits`    | number | ✗  | 6          | 验证码位数 (6或8)                       |
| `period`    | number | ✗  | 30         | 时间步长(秒)                           |
| `timestamp` | number | ✗  | Date.now() | 生成令牌的时间戳                          |

**返回值**: `string` (一次性密码)

### TOTP.verify(options)

| 参数          | 类型     | 必填 | 默认值        | 说明          |
|-------------|--------|----|------------|-------------|
| `token`     | string | ✓  | -          | 待验证的令牌      |
| `secret`    | string | ✓  | -          | Base32编码的密钥 |
| `window`    | number | ✗  | 1          | 时间窗口容差      |
| `algorithm` | string | ✗  | sha1       | 哈希算法        |
| `digits`    | number | ✗  | 6          | 验证码位数       |
| `period`    | number | ✗  | 30         | 时间步长(秒)     |
| `timestamp` | number | ✗  | Date.now() | 验证时间戳       |

**返回值**: `{ success: boolean, delta: number | null }`



### HOTP.generate(options)

| 参数          | 类型     | 必填 | 默认值  | 说明                               |
|-------------|--------|----|------|----------------------------------|
| `secret`    | string | ✓  | -    | Base32编码的密钥                      |
| `counter`    | number | ✓  | -    | 计数器值                               |
| `digits`    | number | ✗  | 6    | 验证码位数 (6或8)                      |
| `algorithm` | string | ✗  | sha1 | 哈希算法 (`sha1`, `sha256`, `sha512`) |

**返回值**: `string` (一次性密码)

### TOTP.verify(options)

| 参数          | 类型     | 必填 | 默认值        | 说明          |
|-------------|--------|----|------------|-------------|
| `token`     | string | ✓  | -          | 待验证的令牌      |
| `secret`    | string | ✓  | -          | Base32编码的密钥 |
| `counter`    | number | ✓  | -          | 计数器值     |
| `digits`    | number | ✗  | 6          | 验证码位数       |
| `window`    | number | ✗  | 1          | 时间窗口容差      |
| `algorithm` | string | ✗  | sha1       | 哈希算法        |

**返回值**: `{ success: boolean, delta: number | null }`

---

## 算法支持

| 算法      | 安全性     | Google认证器兼容 | 推荐场景      |
|---------|---------|-------------|-----------|
| SHA-1   | ⚠️ 一般   | ✅ 完全兼容      | 兼容性要求高的场景 |
| SHA-256 | 🔒 良好   | ⚠️ 部分支持     | 常规安全场景    |
| SHA-512 | 🔒🔒 优秀 | ⚠️ 部分支持     | 高安全要求场景   |

---

## 贡献指南

我们欢迎所有形式的贡献！参与流程：

1. 提交Issue说明问题/建议
2. Fork仓库并创建分支：`git checkout -b fix/issue-123`
3. 遵循编码规范：新增功能需包含单元测试
4. 提交Pull Request并关联Issue

---

## 常见问题

### ❓ 如何生成安全的Base32密钥？

```javascript
import {Common} from 'notp';
// 生成20字节的安全随机密钥
const secret = Common.generateSecret(32);
console.log(secret); // 输出: JBSWY3DPEHPK3PXP
```

### ❓ 验证窗口(window)如何设置？

- 默认值`1`（当前+前后两个30秒窗口）
- 高延迟网络建议设为`3`：

```javascript
TOTP.verify({window: 3, ...})
```

[//]: # (### ❓ 如何生成二维码供用户扫描？)

[//]: # ()
[//]: # (```javascript)

[//]: # (import qrcode from 'qrcode-generator';)

[//]: # (import {TOTP} from 'notp';)

[//]: # (const otpauth = TOTP.getAuthURL&#40;{)

[//]: # (    secret: 'JBSWY3DPEHPK3PXP',)

[//]: # (    label: 'MyApp:user@example.com',)

[//]: # (    issuer: 'MyApp')

[//]: # (}&#41;;)

[//]: # (// 生成二维码)

[//]: # (qrcode.toDataURL&#40;otpauth&#41;;)

[//]: # (```)

---

## 许可证
[MIT License](https://github.com/yutons/notp/blob/main/LICENSE) ©yutons  
允许商业使用、修改和私有部署，需保留版权声明。