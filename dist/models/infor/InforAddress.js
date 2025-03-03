'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class InforAddress extends sequelize_1.Model {
    }
    InforAddress.init({
        name: {
            type: dataTypes.STRING,
        },
        address: {
            type: dataTypes.STRING,
        },
        ownerAddress: {
            type: dataTypes.STRING,
        },
        ownerCity: {
            type: dataTypes.STRING
        },
        ownerState: {
            type: dataTypes.STRING
        },
        ownerZIP: {
            type: dataTypes.STRING
        },
        addrkey: {
            type: dataTypes.STRING
        }
    }, {
        sequelize,
        freezeTableName: true,
        timestamps: false,
        modelName: 'InforAddress',
        tableName: 'surveyData'
    });
    return InforAddress;
};
//# sourceMappingURL=InforAddress.js.map