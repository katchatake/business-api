const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('inventory', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_type: {
      type: DataTypes.ENUM('PRODUCT','VARIANT','SUPPLY'),
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10,4),
      allowNull: true,
      defaultValue: 0.0000
    }
  }, {
    sequelize,
    tableName: 'inventory',
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
        name: "branch_id",
        using: "BTREE",
        fields: [
          { name: "branch_id" },
        ]
      },
    ]
  });
};
