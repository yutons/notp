# NOTP - One-Time Password Library
[![NPM Version](https://img.shields.io/npm/v/notp.svg)](https://npmjs.org/package/notp)
[![License](https://img.shields.io/npm/l/notp.svg)](https://github.com/yutons/notp/blob/main/LICENSE)
[![Test Coverage](https://img.shields.io/codecov/c/github/yutons/notp)](https://codecov.io/gh/yutons/notp)

## 简介

notp 是一个轻量级的 JavaScript 库，实现了两种常见的一次性密码算法：

1. **HOTP (HMAC-based One-Time Password)** - 基于 HMAC 的一次性密码算法 (RFC 4226)
2. **TOTP (Time-based One-Time Password)** - 基于时间的一次性密码算法 (RFC 6238)

该库可用于实现双因素认证 (2FA) 功能，如 Google Authenticator 兼容的验证码生成与验证。

> **安全提示**
> - 密钥存储：避免硬编码密钥，推荐使用环境变量或安全配置中心。
> - 算法选择：SHA-1已不推荐用于高安全场景，优先使用SHA-256/SHA-512。

## 目录
- [特性](#特性)
- [安装](#安装)
- [使用方法](#使用方法)
- [算法支持](#算法支持)
- [API参考](#api-参考)
- [兼容性](#兼容性)
- [许可证](#许可证)
- [相关标准](#相关标准)

## 特性

- 🔐 支持 HOTP（基于计数的一次性密码）- [RFC 4226](https://tools.ietf.org/html/rfc4226)
- 🔐 支持 TOTP（基于时间的一次性密码）- [RFC 6238](https://tools.ietf.org/html/rfc6238)
- 🔄 基于 RFC 4226 (HOTP) 和 RFC 6238 (TOTP) 标准实现
- 📦 支持多种模块格式（CommonJS、ES Module、UMD）
- 📱 兼容 Google Authenticator 和其他主流验证器应用
- 🌐 支持多种编码格式和哈希算法
- 🛡️ 安全实现，易于使用

## 安装

```bash
npm install notp
# 或者
yarn add notp
# 或者
pnpm add notp
# 浏览器安装
<script src="./dist/notp.umd.js"></script>
```

## 使用方法

### HOTP (基于计数的一次性密码)

```javascript
import {HOTP} from 'notp';

// 生成HOTP令牌
const token = HOTP.generate({
    secret: 'JBSWY3DPEHPK3PXP', // Base32编码的密钥
    counter: 1,                // 计数器值
    digits: 6,                 // 验证码位数 (可选，默认6位)
    algorithm: 'sha1'          // 哈希算法 (可选，默认sha1)
});

console.log(token); // 输出: 6-digit numeric token

// 验证HOTP令牌
const result = HOTP.verify({
    token: '123456',           // 待验证的令牌
    secret: 'JBSWY3DPEHPK3PXP', // Base32编码的密钥
    counter: 1,                // 计数器值
    digits: 6,                 // 验证码位数 (可选，默认6位)
    window: 1,                 // 验证窗口 (可选，默认1)
    algorithm: 'sha1'          // 哈希算法 (可选，默认sha1)
});

console.log(result); // 输出: { success: boolean, delta: number | null }
```

### TOTP (基于时间的一次性密码)

#### NPM引用

```javascript
import {TOTP} from 'notp';

// 生成TOTP令牌
const token = TOTP.generate({
    secret: 'JBSWY3DPEHPK3PXP', // Base32编码的密钥
    period: 30,                // 时间步长(秒) (可选，默认30秒)
    digits: 6,                 // 验证码位数 (可选，默认6位)
    timestamp: Date.now(),     // 时间戳 (可选，默认当前时间)
    algorithm: 'sha1'          // 哈希算法 (可选，默认sha1)
});

console.log(token); // 输出: 6-digit numeric token

// 验证TOTP令牌
const result = TOTP.verify({
    token: '123456',           // 待验证的令牌
    secret: 'JBSWY3DPEHPK3PXP', // Base32编码的密钥
    period: 30,                // 时间步长(秒) (可选，默认30秒)
    digits: 6,                 // 验证码位数 (可选，默认6位)
    window: 1,                 // 验证窗口 (可选，默认1)
    timestamp: Date.now(),     // 时间戳 (可选，默认当前时间)
    algorithm: 'sha1'          // 哈希算法 (可选，默认sha1)
});

console.log(result); // 输出: { success: boolean, delta: number | null }
```

#### 浏览器引用

```html

<script src="./dist/notp.umd.js"></script>
<script>
    // 生成TOTP令牌
    const token = notp.TOTP.generate({
        secret: 'JBSWY3DPEHPK3PXP', // Base32编码的密钥
        period: 30,                // 时间步长(秒) (可选，默认30秒)
        digits: 6,                 // 验证码位数 (可选，默认6位)
        timestamp: Date.now(),     // 时间戳 (可选，默认当前时间)
        algorithm: 'sha1'          // 哈希算法 (可选，默认sha1)
    });

    console.log(token); // 输出: 6-digit numeric token

    // 验证TOTP令牌
    const result = TOTP.verify({
        token: '123456',           // 待验证的令牌
        secret: 'JBSWY3DPEHPK3PXP', // Base32编码的密钥
        period: 30,                // 时间步长(秒) (可选，默认30秒)
        digits: 6,                 // 验证码位数 (可选，默认6位)
        window: 1,                 // 验证窗口 (可选，默认1)
        timestamp: Date.now(),     // 时间戳 (可选，默认当前时间)
        algorithm: 'sha1'          // 哈希算法 (可选，默认sha1)
    });

    console.log(result); // 输出: { success: boolean, delta: number | null }
</script>
```

## 算法支持

NOTP 支持以下哈希算法：

- SHA-1 (默认)
- SHA-256
- SHA-512

## API 参考

### HOTP

#### HOTP.generate(options)

生成基于计数的一次性密码。

**参数:**

- `options.secret` (string): Base32编码的密钥
- `options.counter` (number): 计数器值
- `options.digits` (number, optional): 验证码位数，默认为6
- `options.algorithm` (string, optional): 哈希算法('sha1', 'sha256', 'sha512')，默认为'sha1'

**返回值:**

- (string): 一次性密码

#### HOTP.verify(options)

验证基于计数的一次性密码。

**参数:**

- `options.token` (string): 待验证的令牌
- `options.secret` (string): Base32编码的密钥
- `options.counter` (number): 计数器值
- `options.digits` (number, optional): 验证码位数，默认为6
- `options.window` (number, optional): 验证窗口，默认为1
- `options.algorithm` (string, optional): 哈希算法('sha1', 'sha256', 'sha512')，默认为'sha1'

**返回值:**

- (object): 包含 `success` (boolean) 和 `delta` (number | null) 的对象

### TOTP

#### TOTP.generate(options)

生成基于时间的一次性密码。

**参数:**

- `options.secret` (string): Base32编码的密钥
- `options.period` (number, optional): 时间步长(秒)，默认为30
- `options.digits` (number, optional): 验证码位数，默认为6
- `options.timestamp` (number, optional): 时间戳，默认为当前时间
- `options.algorithm` (string, optional): 哈希算法('sha1', 'sha256', 'sha512')，默认为'sha1'

**返回值:**

- (string): 一次性密码

#### TOTP.verify(options)

验证基于时间的一次性密码。

**参数:**

- `options.token` (string): 待验证的令牌
- `options.secret` (string): Base32编码的密钥
- `options.period` (number, optional): 时间步长(秒)，默认为30
- `options.digits` (number, optional): 验证码位数，默认为6
- `options.window` (number, optional): 验证窗口，默认为1
- `options.timestamp` (number, optional): 时间戳，默认为当前时间
- `options.algorithm` (string, optional): 哈希算法('sha1', 'sha256', 'sha512')，默认为'sha1'

**返回值:**

- (object): 包含 `success` (boolean) 和 `delta` (number | null) 的对象

## 兼容性

NOTP 与以下验证器应用兼容：

- Google Authenticator
- Microsoft Authenticator
- Authy
- 其他符合 RFC 4226 和 RFC 6238 标准的验证器

## 许可证
[MIT](https://github.com/yutons/notp/blob/main/LICENSE)

## 相关标准

- [RFC 4226 - HOTP: An HMAC-Based One-Time Password Algorithm](https://tools.ietf.org/html/rfc4226)
- [RFC 6238 - TOTP: Time-Based One-Time Password Algorithm](https://tools.ietf.org/html/rfc6238)
