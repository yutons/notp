import * as CryptoJS from 'crypto-js';
// 私有静态常量
export const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export class Common {

    /**
     * 生成安全的Base32密钥
     * @param length 密钥长度，默认为32
     * @returns Base32编码的密钥字符串
     */
    public static generateSecret(length: number = 32): string {
        const randomBytes = CryptoJS.lib.WordArray.random(20);
        return this.base32Encode(randomBytes);
    }

    /**
     * Base32解码（私有方法）
     */
    private static base32Encode(input: any) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let output = "";
        let bits = 0;
        let value = 0;

        // 将 WordArray 转为字节数组
        const bytes = Buffer.from(input.toString(CryptoJS.enc.Hex), "hex");

        for (let i = 0; i < bytes.length; i++) {
            value = (value << 8) | bytes[i]; // 合并字节
            bits += 8;

            while (bits >= 5) {
                output += chars[(value >>> (bits - 5)) & 31]; // 取高 5 比特
                bits -= 5;
            }
        }

        // 处理剩余比特
        if (bits > 0) {
            output += chars[(value << (5 - bits)) & 31];
        }

        // 填充等号（此处 20 字节恰好整除，无需填充）
        return output; // 输出 32 字符
    }

    /**
     * Base32解码（私有方法）
     */
    public static base32Decode(b32: string): CryptoJS.lib.WordArray {
        const bytes: number[] = [];
        let bits = 0;
        let value = 0;

        for (let i = 0; i < b32.length; i++) {
            const char = b32[i].toUpperCase();
            if (char === '=') break; // 终止填充符
            const index = BASE32_CHARS.indexOf(char);
            if (index === -1) continue; // 跳过无效字符

            value = (value << 5) | index;
            bits += 5;

            if (bits >= 8) {
                bits -= 8;
                bytes.push((value >>> bits) & 0xff);
            }
        }
        return CryptoJS.lib.WordArray.create(Uint8Array.from(bytes));
    }
}