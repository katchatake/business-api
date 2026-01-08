const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('platform_audit_logs', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'platform_admins',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    target_id: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'platform_audit_logs',
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
        name: "admin_id",
        using: "BTREE",
        fields: [
          { name: "admin_id" },
        ]
      },
    ]
  });
};
