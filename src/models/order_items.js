const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('order_items', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    order_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_variant_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    promotion_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'promotions',
        key: 'id'
      }
    },
    product_name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10,4),
      allowNull: false
    },
    unit_price: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    discount_amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0.00
    },
    tax_amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false,
      defaultValue: 0.00
    },
    total_line: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    attributes: {
      type: DataTypes.JSON,
      allowNull: true
    },
    applied_taxes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Snapshot del cálculo: [{\"code\": \"002\", \"base\": 100, \"rate\": 0.16, \"amount\": 16}]"
    }
  }, {
    sequelize,
    tableName: 'order_items',
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
        name: "order_id",
        using: "BTREE",
        fields: [
          { name: "order_id" },
        ]
      },
      {
        name: "promotion_id",
        using: "BTREE",
        fields: [
          { name: "promotion_id" },
        ]
      },
    ]
  });
};
