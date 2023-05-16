const express = require('express');
const bcrypt = require('bcryptjs');


const { User, Group, Membership, GroupImage, Venue } = require('../../db/models');




const router = express.Router();


router.get('/', async (req,res)=>{
   const groups = await Group.findAll({
    order:[['organizerId']]
   })

   res.json({'Groups': groups})
})

router.get('/current', async (req,res)=>{

    const { user } = req

    if (user){
        let groups = await Group.findAll({
            where:{organizerId:req.user.id},
            include:{model:GroupImage}
           })
        //  groups= groups.toJSON()
        const mems = await Membership.findAll({
            where:{
                userId:req.user.id
            }
           })

           const allGroups = []

           for (let people of mems){
              let group = await Group.findOne({
                where:{id:people.groupId},
                include:{model:GroupImage}
              })
            //    group = group.toJSON()
              allGroups.push(group)
           }

        //    allGroups = allGroups.toJSON()
        let news = []
           for (let group of groups.concat(allGroups)){
            group = group.toJSON()
            let numMembers = await Membership.count({
                where:{groupId:group.id}
            })

            group.numMembers = numMembers + 1
            if( group.GroupImages.length == 0){
                console.log('adsfa')
                delete group.GroupImages
            }else{
                for (image of group.GroupImages){
                     if (image.preview == true){
                         group.previewImage = image.url
                        delete group.GroupImages
                     }
                }
            }
            news.push(group)
           }


           res.json({'Groups': news})

    }else{
        res.status(401)
        res.json({
            "message": "Authentication required"
          })
    }
})


 router.get('/:groupId', async (req,res)=>{
    const { groupId } = req.params

    let group = await Group.findOne({
        where:{id : groupId},
        include:[{
            model: GroupImage ,
            attributes:['id','url','preview']
        },{
            model:User,
            attributes:['id','firstName','lastName'],
            as:'Organizer'
        },{
            model:Venue
        }]
    })

    if (!group){
      res.status(404)
     return res.json({
        "message": "Group couldn't be found",
      })
    }
    const numMembers = await Membership.count({
        where:{groupId}
    })
    group = group.toJSON()
    group.numMembers = numMembers
    res.json(group)

 })

 router.post('/', async(req,res)=>{
    const {user} = req

    if (user){
        const {name , about , type, private, city, state } = req.body
        let newGroup = {
            organizerId: req.user.id,
            name,
            about,
            type,
            private,
            city,
            state
        }
        const testing = await Group.build(newGroup)
        // console.log(newGroup)
        try {
            const valid = await testing.validate()
            // newGroup.save()
            newGroup = await Group.create(newGroup)
            res.json(newGroup)
        }catch{
            res.status(400),
            res.json({
                "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
                "errors": {
                  "name": "Name must be 60 characters or less",
                  "about": "About must be 50 characters or more",
                  "type": "Type must be 'Online' or 'In person'",
                  "private": "Private must be a boolean",
                  "city": "City is required",
                  "state": "State is required"
                }
              })
        }



    }else{
        res.status(401)
        res.json({
            "message": "Authentication required"
          })
    }
  })


  router.post('/:groupId/images', async (req,res)=>{
      const { user } = req

      if (user){
        const group = await Group.findByPk(req.params.groupId)
        if (!group ){
            res.status(404)
            return res.json({
                "message": "Group couldn't be found"
              })
        }else if (user.id != group.organizerId){
            res.status(403)
            return res.json({
                "message": "Forbidden"
              })
        }
        const {url, preview} = req.body
        try {
            let newGroupImage = await GroupImage.create({
               url,
               preview: preview == 'true'?true:false
            })

            newGroupImage = await GroupImage.findOne({
                where:{
                    id:newGroupImage.id
                },
                attributes:['id','url','preview']
            })
            res.json(newGroupImage)
        }catch{

        }


      }else{
        res.status(401)
        res.json({
            "message": "Authentication required"
          })
    }
  })

  router.put('/:groupId', async (req,res)=>{
    const {user} = req

    if (user){
        let group = await Group.findByPk(req.params.groupId)
        if (!group ){
            res.status(404)
            return res.json({
                "message": "Group couldn't be found"
              })
        }else if (user.id != group.organizerId){
            res.status(403)
            return res.json({
                "message": "Forbidden"
              })
        }

        const {name ,about, type, private, city, state } = req.body

        if (name) group.name = name
        if (about)  group.about = about
        if (type)  group.type = type
        if (private)  group.private= private
        if (city)  group.city = city
        if (state) group.state = state


        try {
            group = await group.save()
            res.json(group)
        }catch{
            res.status(400)
            res.json({
                "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
                "errors": {
                  "name": "Name must be 60 characters or less",
                  "about": "About must be 50 characters or more",
                  "type": "Type must be 'Online' or 'In person'",
                  "private": "Private must be a boolean",
                  "city": "City is required",
                  "state": "State is required",
                }
              })
        }

    }else{
        res.status(401)
        res.json({
            "message": "Authentication required"
          })
    }
  })

  router.delete('/:groupId', async (req,res)=>{

    const {user} = req

    if (user){
        let group = await Group.findByPk(req.params.groupId)
        if (!group ){
            res.status(404)
            return res.json({
                "message": "Group couldn't be found"
              })
        }else if (user.id != group.organizerId){
            res.status(403)
            return res.json({
                "message": "Forbidden"
              })
        }

        await group.destroy()

        res.json({
            "message": "Successfully deleted"
          })

    }else{
        res.status(401)
        res.json({
            "message": "Authentication required"
          })
    }

  })


module.exports = router;