const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cash_movements', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    shift_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'cash_shifts',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('DEPOSIT','WITHDRAWAL'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'cash_movements',
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
        name: "shift_id",
        using: "BTREE",
        fields: [
          { name: "shift_id" },
        ]
      },
    ]
  });
};
