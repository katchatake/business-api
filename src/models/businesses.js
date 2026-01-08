const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('businesses', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    business_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'business_types',
        key: 'id'
      }
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true
    },
    rfc: {
      type: DataTypes.STRING(13),
      allowNull: true
    },
    legal_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    tax_system_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    saas_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'saas_plans',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('ACTIVE','SUSPENDED_PAYMENT','BANNED','TRIAL'),
      allowNull: true,
      defaultValue: "TRIAL"
    },
    subscription_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'businesses',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "business_type_id",
        using: "BTREE",
        fields: [
          { name: "business_type_id" },
        ]
      },
      {
        name: "fk_saas_plan",
        using: "BTREE",
        fields: [
          { name: "saas_plan_id" },
        ]
      },
      {
        name: "idx_biz_status",
        using: "BTREE",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "idx_biz_expiration",
        using: "BTREE",
        fields: [
          { name: "subscription_end_date" },
        ]
      },
    ]
  });
};
