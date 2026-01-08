const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('orders', {
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
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    shift_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'cash_shifts',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PENDING','COMPLETED','CANCELLED'),
      allowNull: true,
      defaultValue: "PENDING"
    },
    order_type: {
      type: DataTypes.ENUM('INSTORE','TAKEAWAY','DINE_IN'),
      allowNull: true,
      defaultValue: "INSTORE"
    },
    subtotal: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_discount_amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_tax_amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0.00
    },
    total: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0.00
    },
    invoice_status: {
      type: DataTypes.ENUM('UNINVOICED','INVOICED','GLOBAL_PENDING'),
      allowNull: true,
      defaultValue: "UNINVOICED"
    },
    claim_code: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'orders',
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
        name: "shift_id",
        using: "BTREE",
        fields: [
          { name: "shift_id" },
        ]
      },
    ]
  });
};
