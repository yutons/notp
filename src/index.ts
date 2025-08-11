import {HOTP} from './core/hotp';
import {TOTP} from './core/totp';
import {Common} from "../src/utils/common";

const Algorithm = ["SHA1", "SHA256", "SHA512"];

export {HOTP, TOTP, Algorithm, Common};

const notp = {
    HOTP,
    TOTP,
    Algorithm,
    Common
};

export default notp;