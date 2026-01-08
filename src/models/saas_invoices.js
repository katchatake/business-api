const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('saas_invoices', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
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
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PAID','PENDING','FAILED'),
      allowNull: true,
      defaultValue: "PENDING"
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pdf_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'saas_invoices',
    timestamps: true,
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
