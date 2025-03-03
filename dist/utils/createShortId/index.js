"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    let id = '';
    const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz123456789';
    for (let i = 0; i < 5; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id.toUpperCase();
};
//# sourceMappingURL=index.js.map