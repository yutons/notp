# NOTP - One-Time Password Library


[![NPM](https://img.shields.io/npm/v/notp)](https://npmjs.org/package/notp)
[![License](https://img.shields.io/npm/l/notp)](https://github.com/yutons/notp/blob/main/LICENSE)
[![codecov](https://codecov.io/gh/yutons/notp/branch/main/graph/badge.svg)](https://codecov.io/gh/yutons/notp)
[![npm](https://img.shields.io/npm/dm/notp)](https://npm-stat.com/charts.html?package=notp)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/notp)](https://bundlephobia.com/package/notp)
[![GitHub stars](https://img.shields.io/github/stars/yutons/notp)](https://github.com/yutons/notp/stargazers)


🔒 轻量级JavaScript库，实现**HOTP**(RFC 4226)和**TOTP**(RFC 6238)一次性密码算法，提供双因素认证(2FA)解决方案，兼容Google
Authenticator等主流验证器。

> **安全提示**
> - 🚨 **密钥存储**：禁止硬编码密钥，推荐使用环境变量或密钥管理服务

## DEMO地址

[NOTP 动态口令生成器](./demo/)

---

## 目录

- [核心特性](#核心特性)
- [安装指南](#安装指南)
- [快速开始](#快速开始)
- [API参考](#api参考)
- [算法支持](#算法支持)
- [兼容性](#兼容性)
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
  支持SHA-1、SHA-256、SHA-512和国密SM3哈希算法，提供验证窗口动态调整

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
const code = new TOTP(secret).generate();
console.log(`您的验证码：${code}`);
```

### 2. 生成TOTP验证码（浏览器）

```html

<script src="https://cdn.jsdelivr.net/npm/notp/dist/notp.umd.min.js"></script>
<script>
    const isValid = new notp.TOTP().generate();
    console.log(`您的验证码：${code}`);
</script>
```

---

## API参考

### Base32 类

Base32编码、解码和生成随机密钥的工具类。

#### Base32.generate(length)
生成指定长度的Base32随机密钥
- `length` (number): 密钥长度（字节），默认为20字节
- 返回: Base32编码的密钥字符串

#### Base32.encode(bytes)
对字节数组进行Base32编码
- `bytes` (Uint8Array): 需要编码的字节数组
- 返回: Base32编码的字符串

#### Base32.decode(secret)
对Base32编码的字符串进行解码
- [secret](\src\core\totp.ts#L46-L48) (string): Base32编码的字符串
- 返回: 解码后的字节数组

### HOTP 类

HOTP (HMAC-based One-Time Password) 算法实现，遵循 RFC 4226 标准。

#### 构造函数

```typescript 
new HOTP(secret: string, counter?: number, digits?: number, algorithm?: Algorithm)
```
- [secret](\src\core\totp.ts#L46-L48) (string): 共享密钥 (Base32编码)
- [counter](\src\core\hotp.ts#L53-L58) (number): 计数器初始值，默认为0
- [digits](\src\core\totp.ts#L79-L81) (number): 生成的一次性密码的位数，默认为6
- [algorithm](\src\core\totp.ts#L94-L96) (Algorithm): HMAC哈希算法，默认为'sha1'

#### HOTP.generate(counter?)
生成指定计数器值的一次性密码
- [counter](\src\core\hotp.ts#L53-L58) (number): 指定的计数器值 (可选，如果不提供则使用实例的counter)
- 返回: 生成的一次性密码 (字符串)

#### HOTP.verify(otp, counter)
验证提供的OTP是否与指定计数器值生成的OTP匹配
- `otp` (string): 要验证的OTP
- [counter](\src\core\hotp.ts#L53-L58) (number): 用于生成预期OTP的计数器值
- 返回: 验证结果 (boolean)

#### HOTP.next()
生成下一个计数器值的一次性密码，并递增计数器
- 返回: 生成的一次性密码 (字符串)

#### HOTP.getConfiguration()
获取当前配置信息
- 返回: 包含secret、counter、digits和algorithm的对象

#### 属性
- [secret](\src\core\totp.ts#L46-L48): 获取/设置共享密钥
- [counter](\src\core\hotp.ts#L53-L58): 获取/设置计数器值
- [digits](\src\core\totp.ts#L79-L81): 获取/设置密码位数 (6-10)
- [algorithm](\src\core\totp.ts#L94-L96): 获取/设置哈希算法

### TOTP 类

TOTP (Time-based One-Time Password) 算法实现，基于 HOTP，使用时间戳作为计数器，遵循 RFC 6238 标准。

#### 构造函数

```typescript
new TOTP(secret: string, period?: number, digits?: number, algorithm?: Algorithm)
```

- [secret](\src\core\totp.ts#L46-L48) (string): 共享密钥 (Base32编码)
- [period](\src\core\totp.ts#L61-L66) (number): 时间步长（周期），单位为秒，默认为30秒
- [digits](\src\core\totp.ts#L79-L81) (number): 生成的一次性密码的位数，默认为6
- [algorithm](\src\core\totp.ts#L94-L96) (Algorithm): HMAC哈希算法，默认为'sha1'

#### TOTP.generate()
生成当前时间窗口的一次性密码
- 返回: 生成的一次性密码 (字符串)

#### TOTP.verify(otp, window)
验证提供的OTP是否有效
- `otp` (string): 要验证的OTP
- `window` (number): 允许的时间窗口偏差（向前和向后），默认为1
- 返回: 验证结果 (boolean)

#### TOTP.timeRemaining()
获取当前时间窗口的剩余有效时间
- 返回: 剩余有效时间（秒）

#### TOTP.currentPeriodStart()
获取当前时间窗口的开始时间
- 返回: 当前时间窗口的开始时间（Unix时间戳，秒）

#### TOTP.getConfiguration()
获取当前配置信息
- 返回: 包含secret、period、digits、algorithm和timestamp的对象

#### 属性
- [secret](\src\core\totp.ts#L46-L48): 获取/设置共享密钥
- [period](\src\core\totp.ts#L61-L66): 获取/设置时间步长 (正整数)
- [digits](\src\core\totp.ts#L79-L81): 获取/设置密码位数 (6-10)
- [algorithm](\src\core\totp.ts#L94-L96): 获取/设置哈希算法
- [timestamp](\src\core\totp.ts#L111-L116): 获取/设置模拟时间戳 (null表示使用系统当前时间)

### Algorithm 枚举

支持的哈希算法类型:
- [Algorithm.SHA1](\src\core\default.ts#L4-L4): 'sha1'
- [Algorithm.SHA256](\src\core\default.ts#L5-L5): 'sha256'
- [Algorithm.SHA512](\src\core\default.ts#L6-L6): 'sha512'
- [Algorithm.SM3](\src\core\default.ts#L7-L7): 'sm3'

### Default 类

默认配置值:
- [Default.ALGORITHM](\src\core\default.ts#L26-L26): 默认算法 'sha1'
- [Default.PERIOD](\src\core\default.ts#L27-L27): 默认周期 30秒
- [Default.DIGITS](\src\core\default.ts#L28-L28): 默认位数 6
- [Default.WINDOW](\src\core\default.ts#L29-L29): 默认窗口 0
- [Default.SUPPORTED_ALGORITHMS](\src\core\default.ts#L26-L26): 支持的算法列表
- [Default.isSupportedAlgorithm(value)](\src\core\default.ts#L31-L33): 检查字符串是否为支持的算法

## 算法支持

NOTP支持多种哈希算法，以满足不同的安全需求和兼容性要求。

| 算法      | 安全性     | Google Authenticator | Microsoft Authenticator | Authy | 推荐场景      |
|---------|---------|---------------------|------------------------|-------|-----------|
| SHA-1   | ⚠️ 一般   | ✅ 完全兼容            | ✅ 完全兼容               | ✅ 完全兼容 | 兼容性要求高的场景 |
| SHA-256 | 🔒 高     | ❌ 不兼容             | ❌ 不兼容                | ❌ 不兼容 | 安全性要求高的场景 |
| SHA-512 | 🔒 高     | ❌ 不兼容             | ❌ 不兼容                | ❌ 不兼容 | 安全性要求高的场景 |
| SM3     | 🔒 高     | ❌ 不兼容             | ❌ 不兼容                | ❌ 不兼容 | 国密合规场景     |

### 算法选择建议

1. **SHA-1**: 作为默认算法，与大多数主流验证器应用完全兼容，适合需要广泛兼容性的场景。
2. **SHA-256/SHA-512**: 提供更高的安全性，但会失去与主流验证器应用的兼容性，适合内部系统或自定义验证器应用。
3. **SM3**: 中国国家密码管理局发布的密码杂凑算法，符合国密标准，适用于有国密合规要求的场景。

### 使用示例

```javascript 
import {TOTP, Algorithm} from 'notp';
// 使用默认的SHA-1算法 
const totpSha1 = new TOTP('YOUR_SECRET_HERE');
// 使用SHA-256算法 
const totpSha256 = new TOTP('YOUR_SECRET_HERE', 30, 6, Algorithm.SHA256);
// 使用SM3算法 
const totpSm3 = new TOTP('YOUR_SECRET_HERE', 30, 6, Algorithm.SM3);
```

### 注意事项

- 更改算法后，生成的OTP将与之前算法生成的不同
- 在生产环境中更改算法需要重新配置所有用户的验证器应用
- 国密算法(SM3)仅在中国境内有强制要求的场景下推荐使用

---

## 许可证

[MIT License](https://github.com/yutons/notp/blob/main/LICENSE) ©yutons  
允许商业使用、修改和私有部署，需保留版权声明。