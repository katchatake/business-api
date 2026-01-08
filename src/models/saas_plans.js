const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('saas_plans', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    price_monthly: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    price_yearly: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    max_branches: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    max_products: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 100
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'saas_plans',
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
