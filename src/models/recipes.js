const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('recipes', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    supply_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'supplies',
        key: 'id'
      }
    },
    quantity_required: {
      type: DataTypes.DECIMAL(10,4),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'recipes',
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
        name: "product_id",
        using: "BTREE",
        fields: [
          { name: "product_id" },
        ]
      },
      {
        name: "supply_id",
        using: "BTREE",
        fields: [
          { name: "supply_id" },
        ]
      },
    ]
  });
};
