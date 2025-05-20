const { name } = require('agenda/dist/agenda/name');
const Tutor=require('../models/tutorDetailModel');

const getBestTutors=async (req,res)=>{
    try {
        const allTutors=await Tutor.find();
        const bestTutors=[];
        for(let i=0;i<Math.min(10,allTutors.length);i++) {
            bestTutors.push(
                {
                    tutorName:allTutors[i].name,
                    location:allTutors[i].address,
                    photo:allTutors[i].photo
                }
            )
        }
        res.status(200).json(bestTutors);
    }
    catch(err) {
        console.log(err);
        res.status(500).json({Error:err});
    }
};

module.exports={
    getBestTutors
};

