const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('products', {
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
    product_type: {
      type: DataTypes.ENUM('SIMPLE','VARIANT_PARENT','SERVICE'),
      allowNull: true,
      defaultValue: "SIMPLE"
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    },
    cost: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    },
    sku: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    sat_product_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "01010101"
    },
    sat_unit_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "H87"
    },
    tax_object: {
      type: DataTypes.ENUM('01','02','03'),
      allowNull: true,
      defaultValue: "02"
    },
    taxes_config: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Ej: [{\"code\": \"002\", \"rate\": 0.16, \"factor\": \"Tasa\"}]"
    }
  }, {
    sequelize,
    tableName: 'products',
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
