'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// Types
const sequelize_1 = require("sequelize");
exports.default = (sequelize, dataTypes) => {
    class Contact extends sequelize_1.Model {
        static associate({ SiteContact }) {
            this.hasMany(SiteContact, { sourceKey: 'contactId', foreignKey: 'contactId' });
        }
        toJSON() {
            return { ...this.get(), id: undefined };
        }
    }
    Contact.init({
        contactId: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: dataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: dataTypes.STRING,
        },
        company: {
            type: dataTypes.STRING
        },
        email: {
            type: dataTypes.STRING
        },
        inactive: {
            type: dataTypes.NUMBER,
            defaultValue: 0,
            get() {
                const value = this.getDataValue('inactive');
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
        tableName: 'contacts',
        modelName: 'Contact',
    });
    return Contact;
};
//# sourceMappingURL=Contact.js.map