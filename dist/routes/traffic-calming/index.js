"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const attachment_1 = __importDefault(require("./attachment"));
const petition_1 = __importDefault(require("./petition"));
const respondent_1 = __importDefault(require("./respondent"));
const response_1 = __importDefault(require("./response"));
exports.default = (app) => {
    const baseURL = `${process.env.BASE_URL}/${path_1.default.basename(__dirname)}`;
    const setURL = (path, router) => {
        return app.use(`${baseURL}${path}`, router);
    };
    setURL('/attachment', attachment_1.default);
    setURL('/petition', petition_1.default);
    setURL('/respondent', respondent_1.default);
    setURL('/response', response_1.default);
};
//# sourceMappingURL=index.js.map