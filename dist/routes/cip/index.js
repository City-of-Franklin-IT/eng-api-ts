"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const milestone_1 = __importDefault(require("./milestone"));
const phase_1 = __importDefault(require("./phase"));
const project_1 = __importDefault(require("./project"));
const spending_1 = __importDefault(require("./spending"));
const update_1 = __importDefault(require("./update"));
exports.default = (app) => {
    const baseURL = `${process.env.BASE_URL}/${path_1.default.basename(__dirname)}`;
    const setURL = (path, router) => {
        return app.use(`${baseURL}${path}`, router);
    };
    setURL('/milestone', milestone_1.default);
    setURL('/phase', phase_1.default);
    setURL('/project', project_1.default);
    setURL('/spending', spending_1.default);
    setURL('/update', update_1.default);
};
//# sourceMappingURL=index.js.map