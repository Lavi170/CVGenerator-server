const User = require("../models/user");
const Cv = require("../models/cv");
require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  const newUser = new User({ email, password: hash });
  try {
    await User.create(newUser);
    res.status(200).send( newUser );
  } catch (err) {
    res.status(500).send(err.message);
  }
};
//   newUser.save((err, user) => {
//     if (err) {
//       return res.status(500).json({ message: err });
//     }
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//     res.json({ token });
//   });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const isUser = await User.findOne({ email: req.body.email });
    if (!isUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    } else {
      const isMatch = await bcrypt.compare(req.body.password, isUser.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      } else if (isMatch) {
        const token = jwt.sign({ id: isUser._id }, process.env.JWT_SECRET);
        return res.json({ token });
      }
    }
  } catch (err) {
    res.status(500).json({ err });
  }
  // res.send("login")
};

// exports.addList = async (req, res) => {
//     const { email, password } = req.body;
//     const salt = bcrypt.genSaltSync(10);
//     const hash = bcrypt.hashSync(password, salt);
//     const newUser = new User({ email, password: hash });
//     try {
//     await User.create(newUser)
//     res.status(200).send({message: "user created" + newUser})
//     }
//     catch (err) {
//       res.status(500).send(err.message)
//     }}

exports.getUserByToken = async (req, res) => {
  try {
    const realId = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const userInfo = await User.findOne({ _id: realId.id }).populate('cvs');
    if (!userInfo) {
      return res.status(401).json({ message: "Invalid" });
    } else {
      return res.status(202).json({ userInfo });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getCvsByToken = async (req, res) => {
  try {
    const realId = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const userInfo = await User.findOne({ _id: realId.id }).populate('cvs');
    const cvsArr = userInfo.cvs
    console.log(cvsArr);

    if (!userInfo) {
      return res.status(401).json({ message: "Invalid" });
    } else {
      return res.status(202).json({ userInfo });
    }
  } catch (err) {
    res.status(500).send(err);
  }
};



exports.addCv = async (req, res) => {
  try {
    const realId = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const newCv = await Cv.create({ 
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      jobTitle: req.body.jobTitle,
      theEmail: req.body.theEmail,
      img: req.body.img,
     phone: req.body.phone,
     address: req.body.address,
     summary: req.body.summary,
     skills: req.body.skills,
     experience: req.body.experience,
     education: req.body.education,
     languages: req.body.languages,
     hobbies: req.body.hobbies,
     template: req.body.template
    });
    const updateTask = await User.findByIdAndUpdate(
      realId.id,
      { $push: { cvs: {_id: newCv._id} } },
      { new: true }
    )
    res.status(201).json(updateTask);
  } catch (err){
    res.status(504).json(err.message);
  }
};


// exports.deleteMe = async (req, res) => {
//     try{
//         const user = await Task.findByIdAndDelete(req.body.id,
//         {new: true})
//         res.status(201).json(user)
//     }
//     catch{
// res.status(504).json("dumbass")
//     }
// }

exports.deleteCv = async (req, res) => {
  const {id} = jwt.verify(req.body.token, process.env.JWT_SECRET);
  console.log(id);
  try {
    await Cv.findByIdAndDelete(req.body.cvid);
    const newUser = await User.findByIdAndUpdate(
      id,
      {
        $pull: {cvs : { $in : req.body.cvid  }},
      },
      { new: true }
    );
    res.status(201).json(newUser);
  } catch (err){
    res.status(504).json(err.message);
  }
};

// exports.changeChecked = async (req, res) => {
//   try {
//     const taskId = req.body.id;
//     const currentTask = await Task.findById(taskId);
//     const currentState = currentTask.checked;

//     console.log(currentState);

//     const updatedTask = await Task.findByIdAndUpdate(
//       taskId,
//       { $set: { checked: !currentState } },
//       { new: true }
//     );
//     const newUser = await User.findByIdAndUpdate(
//       req.body.userId,
//       {
//         $pull: { tasks: req.body.id  },
//       },
//       { new: true }
//     );

//     res.status(201).json(updatedTask,newUser);
//   } catch (err) {
//     res.status(500).json(err.message);
//   }
// };
exports.editCv = async (req, res) => {
  try {
  
    const newCv = await Cv.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      jobTitle: req.body.jobTitle,
      img: req.body.img,
      theEmail: req.body.theEmail,
      phone: req.body.phone,
      address: req.body.address,
      summary: req.body.summary,
      skills: req.body.skills,
      experience: req.body.experience,
      education: req.body.education,
      languages: req.body.languages,
      hobbies: req.body.hobbies,
      template: req.body.template,
    });

    const cvIdToChange = req.body.cvIdToChange;
    const realId = jwt.verify(req.body.token, process.env.JWT_SECRET).id;
    const tempUser = await User.findById(realId);
    const cvsArr = tempUser.cvs;

    const newArr = cvsArr.map(cv => {
      if (cv._id.toString() === cvIdToChange) {
        return newCv._id;
      }
      return cv;
    });
    
    const cvToDelete = await Cv.findByIdAndDelete(cvIdToChange);

    const updateCv = await User.findByIdAndUpdate(
      realId,
      { $set: { cvs: newArr } },
      { new: true }
    );

    res.status(201).json(updateCv);
  } catch {
    res.status(401).send("uf");
  }
};