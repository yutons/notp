import {Random} from "./random";

/**
 * Base32 编码、解码、生成随机密钥
 */
export class Base32 {
    public static readonly BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    /**
     * 生成Base32随机密钥
     * @param length 密钥长度（字节），默认为20字节
     * @returns Base32编码的密钥字符串
     */
    public static generate(length: number = 20): string {
        // 确保长度是正数
        if (length <= 0) {
            throw new Error("长度必须是正数");
        }
        return this.encode(Random.randomBytes(length));
    }

    /**
     * Base32编码
     * @param bytes 需要编码的字节数组
     * @return Base32编码的字符串
     */
    public static encode(bytes: Uint8Array<any>): string {
        if (!bytes || bytes.length === 0) {
            return "";
        }

        let output = "";
        let bits = 0;
        let value = 0;

        for (let i = 0; i < bytes.length; i++) {
            value = (value << 8) | bytes[i];
            bits += 8;

            while (bits >= 5) {
                output += this.BASE32_CHARS[(value >>> (bits - 5)) & 31];
                bits -= 5;
            }
        }

        if (bits > 0) {
            output += this.BASE32_CHARS[(value << (5 - bits)) & 31];
        }

        // 添加填充字符使其长度为8的倍数
        while (output.length % 8 !== 0) {
            output += '=';
        }

        return output;
    }

    /**
     * Base32解码
     * @param secret Base32编码的字符串
     * @returns 解码后的字节数组
     */
    public static decode(secret: string): Uint8Array<any> {
        if (!secret) {
            return new Uint8Array(0);
        }

        // 移除填充字符并转换为大写
        const cleanSecret = secret.replace(/=+$/, '').toUpperCase();
        const bytes: number[] = [];
        let bits = 0;
        let value = 0;

        for (let i = 0; i < cleanSecret.length; i++) {
            const char = cleanSecret[i];
            const index = this.BASE32_CHARS.indexOf(char);

            // 检查是否为有效的Base32字符
            if (index === -1) {
                // 跳过无效代码
                continue;
                // throw new Error(`无效的Base32字符: ${char}`);
            }

            value = (value << 5) | index;
            bits += 5;

            if (bits >= 8) {
                bits -= 8;
                bytes.push((value >>> bits) & 0xff);
            }
        }

        return Uint8Array.from(bytes);
    }
}
