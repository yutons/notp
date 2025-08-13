/**
 * 多端兼容的加密安全随机数生成工具类
 */
export class Random {
    /**
     * 生成指定长度的加密安全随机字节
     * @param length 字节数（必须是非负整数）
     * @returns Uint8Array
     * @throws 如果当前环境不支持加密安全随机源
     */
    static randomBytes(length: number): Uint8Array<any> {
        if (!Number.isInteger(length) || length < 0) {
            throw new TypeError('Random.randomBytes: length must be a non-negative integer');
        }

        // 1. 浏览器 / React Native / Electron / Deno（Web Crypto API）
        if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
            const array = new Uint8Array(length);
            crypto.getRandomValues(array);
            return array;
        }

        // 2. Node.js
        if (typeof process !== 'undefined' && process.versions?.node) {
            try {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const cryptoNode = require('crypto');
                return new Uint8Array(cryptoNode.randomBytes(length));
            } catch (err) {
                throw new Error('Node.js crypto module failed to load');
            }
        }

        // 3. Deno（独立判断，虽然上面可能已覆盖）
        /*if (typeof Deno !== 'undefined') {
            const array = new Uint8Array(length);
            return Deno.crypto.getRandomValues(array);
        }*/

        // 4. 兜底：不支持的环境
        throw new Error('Random.randomBytes: no secure random number generator available in this environment');
    }

    /**
     * 生成随机整数（闭区间 [min, max]）
     * @param min 最小值（整数）
     * @param max 最大值（整数）
     * @returns 随机整数
     */
    static randomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        const range = max - min + 1;
        const bytes = this.randomBytes(4); // 4 字节足够
        const value = new DataView(bytes.buffer).getUint32(0, false);
        return min + (value % range);
    }

    /**
     * 生成随机十六进制字符串（常用于 token）
     * @param length 字节长度（输出字符串长度为 length * 2）
     * @returns 十六进制字符串
     */
    static randomHex(length: number): string {
        const bytes = this.randomBytes(length);
        return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 生成 Base32 编码的随机字符串（用于 TOTP 密钥）
     * @param length 字节长度（建议 20）
     * @returns Base32 字符串
     */
    static randomBase32(length: number): string {
        const bytes = this.randomBytes(length);
        return this.uint8ArrayToBase32(bytes);
    }

    /**
     * 内部：Uint8Array 转 Base32（RFC 4648）
     */
    private static uint8ArrayToBase32(data: Uint8Array<any>): string {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = '';
        let base32 = '';

        for (let i = 0; i < data.length; i++) {
            bits += data[i].toString(2).padStart(8, '0');
        }

        for (let i = 0; i < bits.length; i += 5) {
            const chunk = bits.slice(i, i + 5);
            if (chunk.length === 5) {
                base32 += alphabet[parseInt(chunk, 2)];
            }
        }

        while (base32.length % 8 !== 0) {
            base32 += '=';
        }

        return base32;
    }

    // 禁止实例化
    private constructor() {
        throw new Error('Random is a static class and cannot be instantiated.');
    }
}