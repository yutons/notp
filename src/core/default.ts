/**
 * HMAC 算法类型枚举
 */
export const AlgorithmValues = {
    SHA1: 'sha1',
    SHA256: 'sha256',
    SHA512: 'sha512',
    SM3: 'sm3'
} as const;

export type Algorithm = typeof AlgorithmValues[keyof typeof AlgorithmValues];
export const Algorithm = AlgorithmValues;

/**
 * 默认配置
 */
export class Default {
    public static readonly ALGORITHM: Algorithm = Algorithm.SHA1;
    public static readonly PERIOD = 30;
    public static readonly DIGITS = 6;
    public static readonly WINDOW = 0;


    /**
     * 运行时支持的算法列表（自动从 enum 生成）
     */
    public static SUPPORTED_ALGORITHMS = Object.values(AlgorithmValues) as readonly Algorithm[];

    /**
     * 类型守卫：检查字符串是否为支持的算法
     */
    public static isSupportedAlgorithm(value: string): value is Algorithm {
        return this.SUPPORTED_ALGORITHMS.includes(value as Algorithm);
    }
}