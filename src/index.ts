import {Algorithm, Default} from './core/default'
import {HOTP} from './core/hotp';
import {TOTP} from './core/totp';
import {Base32} from "./core/base32";

const notp = {
    Algorithm,
    Default,
    Base32,
    HOTP,
    TOTP
};

export default notp;
