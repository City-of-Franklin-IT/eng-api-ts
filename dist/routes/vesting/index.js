"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const approval_1 = __importDefault(require("./approval"));
const extension_1 = __importDefault(require("./extension"));
const milestone_1 = __importDefault(require("./milestone"));
const notification_1 = __importDefault(require("./notification"));
const period_1 = __importDefault(require("./period"));
const project_1 = __importDefault(require("./project"));
const resolution_1 = __importDefault(require("./resolution"));
const vesting_extension_1 = __importDefault(require("./vesting-extension"));
exports.default = (app) => {
    const baseURL = `${process.env.BASE_URL}/${path_1.default.basename(__dirname)}`;
    const setURL = (path, router) => {
        return app.use(`${baseURL}${path}`, router);
    };
    setURL('/approval', approval_1.default);
    setURL('/extension', extension_1.default);
    setURL('/milestone', milestone_1.default);
    setURL('/notification', notification_1.default);
    setURL('/period', period_1.default);
    setURL('/project', project_1.default);
    setURL('/resolution', resolution_1.default);
    setURL('/vesting-extension', vesting_extension_1.default);
};
//# sourceMappingURL=index.js.map