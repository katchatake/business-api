const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('fiscal_invoices', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    uuid: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: "uuid"
    },
    xml_content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pdf_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PENDING','STAMPED','ERROR'),
      allowNull: true,
      defaultValue: "PENDING"
    }
  }, {
    sequelize,
    tableName: 'fiscal_invoices',
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
        name: "uuid",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "uuid" },
        ]
      },
    ]
  });
};
