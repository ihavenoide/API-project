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
        foreignKey:'organizerId',
        as:"Organizer"
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

      Group.hasMany(models.Membership,{
        foreignKey:'groupId'
      })
    }
  }
  Group.init({
    organizerId: DataTypes.INTEGER,
    name: {
      type:DataTypes.STRING,
      validate:{
        len:[1,60]
      }
    },
    about: {
      type:DataTypes.TEXT,
      validate:{
        len:[50,3000]
      }
    },
    type: DataTypes.ENUM('Online','In person'),
    private: DataTypes.BOOLEAN,
    city: {
      type:DataTypes.STRING,
      allowNull:false
    },
    state:{
      type:DataTypes.STRING,
      allowNull:false
    },
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
