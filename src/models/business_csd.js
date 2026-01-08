const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('business_csd', {
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
    certificate_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    file_cer_path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_key_path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    key_password_encrypted: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    expiration_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'business_csd',
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
