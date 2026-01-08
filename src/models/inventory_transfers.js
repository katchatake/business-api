const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('inventory_transfers', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    business_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    origin_branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    destination_branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    item_type: {
      type: DataTypes.ENUM('PRODUCT','VARIANT','SUPPLY'),
      allowNull: true
    },
    quantity: {
      type: DataTypes.DECIMAL(10,4),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING','RECEIVED','CANCELLED'),
      allowNull: true
    },
    received_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'inventory_transfers',
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
    ]
  });
};
