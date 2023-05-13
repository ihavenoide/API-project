'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group.hasMany(models.Event, {
        foreignKey:'groupId'
      })

      Group.belongsTo(models.User,{
        foreignKey:'organizerId'
      })

      Group.belongsToMany(models.User,{
        through:'Membership',
        foreignKey:'groupId',
        otherKey:'userId'
      })

      Group.hasMany(models.Venue,{
        foreignKey:'groupId'
      })

      Group.hasMany(models.GroupImage,{
        foreignKey:'groupId'
      })
    }
  }
  Group.init({
    organizerId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    about: DataTypes.TEXT,
    type: DataTypes.ENUM('placeholder','placeholder1'),
    private: DataTypes.BOOLEAN,
    city: DataTypes.STRING,
    state: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
