const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('customer_ledger', {
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
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    source_type: {
      type: DataTypes.ENUM('ORDER','PAYMENT'),
      allowNull: false
    },
    source_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('DEBIT','CREDIT'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    new_balance: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'customer_ledger',
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
    ]
  });
};
