import {HOTP} from './core/hotp';
import {TOTP} from './core/totp';

const Algorithm = ["SHA1", "SHA256", "SHA512"];

export {HOTP, TOTP, Algorithm};

const notp = {
    HOTP,
    TOTP,
    Algorithm
};

export default notp;