const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('customers', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'businesses',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    rfc: {
      type: DataTypes.STRING(13),
      allowNull: true
    },
    legal_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email_invoice: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    current_debt: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    tableName: 'customers',
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
        name: "business_id",
        using: "BTREE",
        fields: [
          { name: "business_id" },
        ]
      },
    ]
  });
};
