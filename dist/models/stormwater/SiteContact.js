'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class SiteContact extends sequelize_1.Model {
        static associate({ Contact, Site }) {
            this.belongsTo(Contact, { targetKey: 'contactId', foreignKey: 'contactId' });
            this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    SiteContact.init({
        siteId: {
            type: dataTypes.STRING,
            allowNull: false
        },
        contactId: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        isPrimary: {
            type: dataTypes.NUMBER,
            defaultValue: false,
            get() {
                const value = this.getDataValue('isPrimary');
                return value === null ? null : !!value;
            }
        },
        isContractor: {
            type: dataTypes.NUMBER,
            defaultValue: false,
            get() {
                const value = this.getDataValue('isContractor');
                return value === null ? null : !!value;
            }
        },
        isInspector: {
            type: dataTypes.NUMBER,
            defaultValue: false,
            get() {
                const value = this.getDataValue('isInspector');
                return value === null ? null : !!value;
            }
        },
        uuid: {
            type: dataTypes.UUID,
            allowNull: false,
            defaultValue: dataTypes.UUIDV4
        },
        createdBy: {
            type: dataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: dataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.fn('getdate')
        },
        updatedBy: {
            type: dataTypes.STRING,
            allowNull: false
        },
        updatedAt: {
            type: dataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.Sequelize.fn('getdate')
        }
    }, {
        sequelize,
        tableName: 'site_contacts',
        modelName: 'SiteContact',
    });
    return SiteContact;
};
//# sourceMappingURL=SiteContact.js.map