import * as CryptoJS from 'crypto-js';

/**
 * HMAC 算法类型枚举
 */
export enum Algorithm {
    SHA1 = 'SHA1',
    // TODO
    // SHA256 = 'SHA256',
    // SHA512 = 'SHA512'
}

export class Common {

    public static readonly BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    public static readonly DEFAULT_ALGORITHM: Algorithm = Algorithm.SHA1;
    public static readonly DEFAULT_PERIOD = 30;
    public static readonly DEFAULT_DIGITS = 6;
    public static readonly DEFAULT_WINDOW = 1;

    /**
     * 生成安全的Base32密钥
     * @param length 密钥长度，默认为32
     * @returns Base32编码的密钥字符串
     */
    public static generateSecret(length: number = 32): string {
        const randomBytes = CryptoJS.lib.WordArray.random(20); // 固定20字节 => 32字符Base32
        return this.base32Encode(randomBytes);
    }

    /**
     * Base32编码（私有方法）
     * @param input 输入的 WordArray 数据
     * @returns Base32编码后的字符串
     */
    private static base32Encode(input: CryptoJS.lib.WordArray): string {
        let output = "";
        let bits = 0;
        let value = 0;

        // 将 WordArray 转为字节数组
        const bytes = new Uint8Array(input.words.length * 4);
        for (let i = 0; i < input.words.length; i++) {
            const word = input.words[i];
            bytes[i * 4] = (word >> 24) & 0xff;
            bytes[i * 4 + 1] = (word >> 16) & 0xff;
            bytes[i * 4 + 2] = (word >> 8) & 0xff;
            bytes[i * 4 + 3] = word & 0xff;
        }

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

        return output;
    }

    /**
     * Base32解码（公共方法）
     * @param b32 Base32编码的字符串
     * @returns 解码后的 WordArray 数据
     */
    public static base32Decode(b32: string): CryptoJS.lib.WordArray {
        const bytes: number[] = [];
        let bits = 0;
        let value = 0;

        for (let i = 0; i < b32.length; i++) {
            const char = b32[i].toUpperCase();
            if (char === '=') break;
            const index = this.BASE32_CHARS.indexOf(char);
            if (index === -1) {
                // 跳过无效代码
                continue;
            }

            value = (value << 5) | index;
            bits += 5;

            if (bits >= 8) {
                bits -= 8;
                bytes.push((value >>> bits) & 0xff);
            }
        }
        return CryptoJS.lib.WordArray.create(Uint8Array.from(bytes));
    }

    /**
     * WordArray转Uint8Array
     */
    public static wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array<any> {
        const len = wordArray.sigBytes;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = (wordArray.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }
        return bytes;
    }

    /**
     * 判断加密算法是否支持
     * @param algorithm
     */
    public static containsAlgorithm(algorithm: string): algorithm is Algorithm {
        return Object.values(Algorithm).includes(algorithm.toUpperCase() as Algorithm);
    }

    /**
     * 计算时间步数
     * @param timestamp - 毫秒时间戳
     * @param period - 时间步长（秒）
     * @returns 时间步数
     */
    public static calculateTimeStep(timestamp: number, period: number): number {
        return Math.floor(timestamp / 1000 / period);
    }

    /**
     * 校验算法参数是否合法
     * @param algorithm - 算法名称
     * @throws {Error} 不支持的算法时抛出错误
     */
    public static validateAlgorithm(algorithm: string): asserts algorithm is Algorithm {
        if (!Common.containsAlgorithm(algorithm)) {
            throw new Error(`Unsupported algorithm: ${algorithm}`);
        }
    }
}
