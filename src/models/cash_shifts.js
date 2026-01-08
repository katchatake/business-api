const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cash_shifts', {
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
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    start_amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      defaultValue: 0.00
    },
    end_amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('OPEN','CLOSED'),
      allowNull: true,
      defaultValue: "OPEN"
    }
  }, {
    sequelize,
    tableName: 'cash_shifts',
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
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
    ]
  });
};
