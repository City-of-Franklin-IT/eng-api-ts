"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const traffic_calming_1 = require("@models/traffic-calming");
exports.default = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const prefix = `${year}-`;
    let count = await traffic_calming_1.Petition.count({
        where: {
            petitionId: {
                [sequelize_1.Op.like]: `${prefix}%`
            }
        }
    });
    let petitionId = `${prefix}${count + 1}`;
    let petitionExists = await traffic_calming_1.Petition.findOne({ where: { petitionId } });
    while (petitionExists) {
        count++;
        petitionId = `${prefix}${count + 1}`;
        petitionExists = await traffic_calming_1.Petition.findOne({ where: { petitionId } });
    }
    return petitionId;
};
//# sourceMappingURL=index.js.map