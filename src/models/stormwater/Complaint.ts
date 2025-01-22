'use strict';
import moment from "moment"

// Types
import { Sequelize, Model, DataTypes, ModelStatic } from "sequelize"
import { ComplaintInterface, ComplaintCreationAttributes, InspectorInterface, InspectorCreationAttributes, FollowUpDateInterface, FollowUpDateCreationAttributes, SiteInterface, SiteCreationAttributes } from './types'

export default (sequelize: Sequelize, dataTypes: typeof DataTypes) => {

  class Complaint extends Model<ComplaintInterface, ComplaintCreationAttributes> {
    declare complaintId: string
    declare date: Date | string
    declare siteId: string | null
    declare inspectorId: string | null
    declare name: string | null
    declare address: string | null
    declare phone: string | null
    declare email: string | null
    declare xCoordinate: string | null
    declare yCoordinate: string | null
    declare locationDescription: string | null
    declare concern: string
    declare otherConcern: string | null
    declare details: string
    declare responsibleParty: string | null
    declare comments: string | null
    declare compliance: boolean | null
    declare closed: boolean | null
    declare uuid: string
    declare createdBy: string
    declare createdAt: Date
    declare updatedBy: string
    declare updatedAt: Date

    static associate({ Inspector, FollowUpDate, Site }: { Inspector: ModelStatic<Model<InspectorInterface, InspectorCreationAttributes>>, FollowUpDate: ModelStatic<Model<FollowUpDateInterface, FollowUpDateCreationAttributes>>, Site: ModelStatic<Model<SiteInterface, SiteCreationAttributes>> }) {
      this.belongsTo(Site, { targetKey: 'siteId', foreignKey: 'siteId' })
      this.hasOne(Inspector, { sourceKey: 'inspectorId', foreignKey: 'inspectorId' })
      this.hasMany(FollowUpDate, { sourceKey: 'complaintId', foreignKey: 'complaintId' })
    }

    toJSON() {
      return { ...this.get(), id: undefined }
    }
  }

  Complaint.init({
    complaintId: {
      type: dataTypes.STRING,
      allowNull: false
    },
    date: {
      type: dataTypes.DATEONLY,
      allowNull: false,
      get() {
        const date = this.getDataValue('date') ? moment(this.getDataValue('date')).format('MM-DD-YYYY') : null
        return date
      }
    },
    siteId: {
      type: dataTypes.STRING,
    },
    inspectorId: {
      type: dataTypes.STRING,
    },
    name: {
      type: dataTypes.STRING
    },
    address: {
      type: dataTypes.STRING
    },
    phone: {
      type: dataTypes.STRING
    },
    email: {
      type: dataTypes.STRING
    },
    xCoordinate: {
      type: dataTypes.STRING,
    },
    yCoordinate: {
      type: dataTypes.STRING,
    },
    locationDescription: {
      type: dataTypes.STRING
    },
    concern: {
      type: dataTypes.STRING,
      allowNull: false
    },
    otherConcern: {
      type: dataTypes.STRING
    },
    details: {
      type: dataTypes.STRING,
      allowNull: false
    },
    responsibleParty: {
      type: dataTypes.STRING
    },
    comments: {
      type: dataTypes.STRING
    },
    compliance: {
      type: dataTypes.NUMBER,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('compliance')
        return value === null ? null : !!value
      }
    },
    closed: {
      type: dataTypes.NUMBER,
      defaultValue: 0,
      get() {
        const value = this.getDataValue('closed')
        return value === null ? null : !!value
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
      defaultValue: Sequelize.fn('getdate')
    },
    updatedBy: {
      type: dataTypes.STRING,
      allowNull: false
    },
    updatedAt: {
      type: dataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn('getdate')
    }
  }, {
    sequelize,
    tableName: 'complaints',
    modelName: 'Complaint',
  })

  return Complaint
}