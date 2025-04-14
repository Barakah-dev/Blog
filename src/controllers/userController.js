const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Users = require("../models/users")

exports.userSignUp = async (req, res) => {
  try {
    const { firstName, lastName, userName, phone, email, password} = req.body;
    
    if (!firstName || !lastName || !userName || !phone || !email || !password) {
      return res.status(400).json({ status: false, message: "Please input all fields!" });
    }

    const isExisting = await Users.findOne({email});
    if (isExisting) {
      return res.status(400).json({ status: false, message: "User already exist!" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new Users({
      firstName, lastName, userName, phone, email, password: hashedPassword
    });

    await newUser.save();
    res.status(200).json({ status: true, message: "User created successfully!"});
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while creating the user" });
  }
}

exports.logIn = async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: false, message: "Please input both fields!" });
    }

    const user = await Users.findOne({email});
    if (!user) {
      return res.status(400).json({ status: false, message: "Invalid username or password!" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(400).json({ status: false, message: "Invalid username or password!" });
    }
    // let token = jwt.sign({ id: user._id }, "secretKey");
    const token = jwt.sign(
      {id: user._id},
      process.env.JWT_SECRET_KEY,
      {expiresIn: '3h'}
    )
    res.status(200).json(
      {
        status: true,
        message: `Login successful, welcome ${user.firstName}`,
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          email: user.email,
          phone: user.phone,
          token
        }
      }); 

  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while logging in" });
  }
}

exports.fetchAllUsers = async (req, res) => {
  try {
    const allUsers = await Users.find(
      { isDeleted: { $ne: true }, deletedAt: { $in: [null, undefined] } },
      "firstName lastName userName phone email"
    );
    res.status(200).json({status: true, message: "Operation successful", data: allUsers});
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while fetching sers" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({ status: false, error: "User query parameter is required" });
    }

    const user = await Users.findById(id);
    if (!user || user.isDeleted == true || user.deletedAt) {
      return res.status(404).json({ status: false, message: "User does not exist!" });
    }

    res.status(200).json({
      status: true,
      message: "Operation successful",
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        phone: user.phone,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    })
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while fetching the user" });
    
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { id, firstName, lastName, phone,} = req.body;

    const user = await Users.findById(id);
    if (!user || user.isDeleted == true || user.deletedAt) {
      return res.status(404).json({ status: false, message: "User does not exist!" });
    }

    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }
    if (phone) {
      user.phone = phone;
    }

    const updateUser = await user.save();
    res.status(200).json({
      status: false,
      message: "Operation successful",
      data: {
        firstName: updateUser.firstName,
        lastName: updateUser.lastName,
        userName: updateUser.userName,
        email: updateUser.email,
        phone: updateUser.phone,
        createdAt: updateUser.createdAt,
        updatedAt: updateUser.updatedAt,
      }
    })
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while updating the user" });
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const {id} = req.params;

    const user = await Users.findByIdAndUpdate(
      id, {isDeleted: true, deletedAt: new Date()}
    )

    if (!user || user.isDeleted == true || user.deletedAt) {
      return res.status(404).json({ status: false, message: "User does not exist!" })
    }

    res.status(200).json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while deleting the user" });
  }
}

exports.hardDelete = async(req, res) => {
  try {
    const {id} = req.params;

    const user = await Users.findByIdAndDelete(id);
    if (!user || user.isDeleted == true || user.deletedAt) {
      return res.status(404).json({ status: false, message: "User does not exist!" })
    }
    
    res.status(200).json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, error: "An error occurred while deleting the user" });
  }
}